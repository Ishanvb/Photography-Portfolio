import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { photoAspects, preloadPhotos } from '~/content/photos';
import { fallBackToOriginal, resized, THUMB_WIDTH } from '~/content/imageUrl';
import * as S from './GalleryView.styled';

/* =========================
   Tuning
========================= */

/**
 * How the gallery is built.
 *
 * One photo at a time in the middle of the screen, and along the whole bottom
 * of it — where the home reel's scroll block stands — a belt of square
 * thumbnails, each about as big as a line of that block. The belt runs under a
 * fixed frame at the middle of the screen, so whichever photo is up is always
 * the one in the centre of the strip.
 *
 * The belt has no ends: it carries on through the list and comes back round.
 * Because the whole list is usually narrower than the screen, the belt is built
 * from as many repeats of it as it takes to reach both edges — so a photo can
 * appear more than once along the bottom, which is what looping through a short
 * list across a wide screen looks like.
 *
 * Scrolling drives one number, `pos`, measured in photos and free to run past
 * either end of the list. The belt reads it straight; the centre reads it as a
 * cross-fade between the two photos it falls between. A push always lands on a
 * photo, never between two.
 */

// Gaps around the centre photo: it fills whatever is left between the title at
// the top and the belt at the bottom.
const CENTRE_TOP_GAP = 30;
const CENTRE_BOTTOM_GAP = 30;

// The cross-fade is deliberately over-driven: both photos sit near-opaque
// through the middle of a change, so the swap reads as a swap rather than as
// two half-transparent photos laid over each other.
const CROSSFADE = 1.4;
const REST_SCALE = 0.94; // how small a photo has shrunk to by the time it is gone

// The belt, sized off the scroll block it stands in for: a square per photo, as
// tall as one of that block's lines. The gap doubles as the breathing room the
// centre frame needs, so the frame lands exactly halfway between two squares.
const BELT_SIZES = [
  { max: 480, square: 12, gap: 5 },
  { max: 768, square: 14, gap: 6 },
  { max: Infinity, square: 22, gap: 8 }
];
const BELT_DIM = 0.25;   // how far down a thumbnail fades out toward the edges
const BELT_MARGIN = 4;   // squares kept beyond each edge, so nothing pops in

// Scrolling. Momentum, then a detent: a push that got a quarter of the way into
// a change carries on through it, anything less falls back.
const DRAG_PER_PHOTO = 150;  // px of drag on the photo that advances one photo
const WHEEL_PER_PHOTO = 260; // px of wheel delta that advances one photo
const FRICTION = 0.9;
const SETTLE = 0.16;
const CARRY_ON = 0.25;
const DRAG_THRESHOLD = 6;
const LOAD_INTERVAL = 70;    // ms between image requests, nearest photo first

/* =========================
   Helpers
========================= */

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
const smoothstep = (t) => t * t * (3 - 2 * t);
const mod = (n, m) => ((n % m) + m) % m;

/** How far `a` sits from `b` on a belt of period `m`, the short way round. */
const wrapDelta = (a, b, m) => mod(a - b + m / 2, m) - m / 2;

const beltDims = () => {
  const width = typeof window === 'undefined' ? 1440 : window.innerWidth;
  return BELT_SIZES.find((size) => width <= size.max) ?? BELT_SIZES[BELT_SIZES.length - 1];
};

/**
 * How many squares the belt needs. Enough to cross the screen with a margin
 * beyond each edge, rounded up to a whole number of repeats of the list — so
 * the belt's period is a multiple of the list's and the loop is seamless.
 */
const beltSlots = (width, pitch, n) => {
  if (!n) return 0;
  const across = Math.ceil(width / pitch) + BELT_MARGIN * 2;
  return Math.max(n, Math.ceil(across / n) * n);
};

/** Where a push should come to rest — always on a photo, never between two. */
const restingPoint = (pos, direction) => {
  const base = Math.floor(pos);
  const frac = pos - base;
  if (direction < 0) return frac < 1 - CARRY_ON ? base : base + 1;
  return frac > CARRY_ON ? base + 1 : base;
};

/* =========================
   Component
========================= */

function GalleryView({ active, photos, onCentreChange }) {
  const [shown, setShown] = useState(false);
  // How many squares the belt is built from. Set from measure(), which is the
  // only place the screen's width is known.
  const [slotCount, setSlotCount] = useState(0);

  const stageRef = useRef(null);
  const centreRef = useRef(null);
  const beltRef = useRef(null);
  const markerRef = useRef(null);
  const itemsRef = useRef([]);
  const slotsRef = useRef([]);
  const onCentreRef = useRef(onCentreChange);

  const engine = useRef({
    raf: 0,
    running: false,
    pos: 0,        // where the belt sits, in photos; free to run past either end
    vel: 0,
    target: null,
    direction: 1,
    dragging: false,
    dragMoved: 0,
    lastX: 0,
    perPhoto: DRAG_PER_PHOTO,
    dims: BELT_SIZES[BELT_SIZES.length - 1],
    pitch: 30,
    reach: 20,     // half the screen, in squares — how far the belt fades over
    period: 0,     // the belt's length in squares, a whole number of repeats
    centre: -1,
    lastLoadAt: -Infinity
  });

  /* ---------- per-photo records ---------- */

  const items = useMemo(
    () =>
      photos.map((photo, index) => {
        const item = {
          index,
          photo,
          aspect: photoAspects.get(photo.jpg) ?? 1.5,
          frame: null,
          frameImg: null,
          frameSource: null,
          requested: false,
          // last written styles, so a frame only touches what actually changed
          wroteFrame: '',
          wroteFrameOp: -1,
          wroteFrameZ: -1,
          wroteSize: -1
        };
        // Stable across renders — an inline ref callback is torn down and
        // reattached on every render, which can null the node mid-frame.
        item.setFrame = (el) => {
          item.frame = el;
          item.wroteSize = -1;
          item.wroteFrame = '';
        };
        item.setFrameImg = (el) => { item.frameImg = el; };
        item.setFrameSource = (el) => { item.frameSource = el; };
        return item;
      }),
    [photos]
  );

  /* ---------- the belt's slots ---------- */

  // Slot k always shows photo k % n, so the belt repeats the list exactly and a
  // slot never has to change which photo it holds — only where it sits.
  const slots = useMemo(() => {
    const n = items.length;
    if (!n) return [];
    return Array.from({ length: slotCount }, (_, k) => {
      const slot = {
        k,
        item: items[k % n],
        el: null,
        img: null,
        wroteTransform: '',
        wroteOp: -1,
        wroteSize: -1,
        wroteHit: ''
      };
      slot.setEl = (el) => {
        slot.el = el;
        slot.wroteSize = -1;
        slot.wroteTransform = '';
      };
      slot.setImg = (el) => { slot.img = el; };
      return slot;
    });
  }, [items, slotCount]);

  // All three are read from the frame loop, never during render.
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  useEffect(() => {
    onCentreRef.current = onCentreChange;
  }, [onCentreChange]);

  /**
   * Point a photo's big <picture> in the middle at the full file, and every
   * square on the belt showing it at the same small copy — one download each.
   */
  const requestImage = useCallback((item) => {
    const { jpg, webp } = item.photo;
    if (webp && item.frameSource) item.frameSource.srcset = webp;
    if (item.frameImg) item.frameImg.src = jpg;
    // The belt's squares are at most 22px: a small copy, not the full photo.
    const thumb = resized(jpg, THUMB_WIDTH);
    slotsRef.current.forEach((slot) => {
      if (slot.item === item && slot.img) slot.img.src = thumb;
    });
    item.requested = true;
    return true;
  }, []);

  /* ---------- geometry ---------- */

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const belt = beltRef.current;
    const centre = centreRef.current;
    if (!stage || !belt || !centre) return;
    const e = engine.current;
    const n = itemsRef.current.length;

    const dims = beltDims();
    e.dims = dims;
    e.pitch = dims.square + dims.gap;

    // The belt runs the full width of the screen.
    belt.style.height = `${dims.square + dims.gap * 2}px`;
    const beltWidth = belt.clientWidth;
    e.reach = Math.max(1, beltWidth / 2 / e.pitch);

    const wanted = beltSlots(beltWidth, e.pitch, n);
    e.period = wanted;
    setSlotCount((current) => (current === wanted ? current : wanted));

    if (markerRef.current) {
      // Half a pitch either side of centre, so the frame meets — and never
      // overlaps — the squares next in line.
      markerRef.current.style.width = `${e.pitch}px`;
      markerRef.current.style.height = `${e.pitch}px`;
    }

    // The centre photo takes everything between the title and the belt.
    const stageRect = stage.getBoundingClientRect();
    const beltRect = belt.getBoundingClientRect();
    const titleEl = document.querySelector('[data-title-anchor]');
    const titleBottom = titleEl
      ? titleEl.getBoundingClientRect().bottom
      : stageRect.top + 150;

    centre.style.top = `${Math.max(0, Math.round(titleBottom - stageRect.top + CENTRE_TOP_GAP))}px`;
    centre.style.bottom = `${Math.max(0, Math.round(stageRect.bottom - beltRect.top + CENTRE_BOTTOM_GAP))}px`;

    const bandW = centre.clientWidth;
    const bandH = centre.clientHeight;

    // Each photo's box is its own shape, as large as the band allows. Everything
    // the frame loop does after this is transform-only.
    itemsRef.current.forEach((item) => {
      const height = Math.max(40, Math.round(Math.min(bandH, bandW / item.aspect)));
      if (item.frame && item.wroteSize !== height) {
        item.frame.style.height = `${height}px`;
        item.frame.style.width = `${Math.round(height * item.aspect)}px`;
        item.wroteSize = height;
      }
    });

    slotsRef.current.forEach((slot) => {
      if (slot.el && slot.wroteSize !== dims.square) {
        slot.el.style.width = `${dims.square}px`;
        slot.el.style.height = `${dims.square}px`;
        slot.wroteSize = dims.square;
      }
    });
  }, []);

  /* ---------- frame ---------- */

  const render = useCallback(() => {
    const e = engine.current;
    const list = itemsRef.current;
    const belt = slotsRef.current;
    const n = list.length;
    if (!n) return false;

    const now = performance.now();

    // Physics, then the detent. Nothing is clamped: the belt runs on round the
    // list in either direction.
    let settling = false;
    if (!e.dragging) {
      if (e.target !== null) {
        e.pos = lerp(e.pos, e.target, SETTLE);
        settling = true;
        if (Math.abs(e.target - e.pos) < 0.002) {
          e.pos = e.target;
          e.target = null;
          settling = false;
        }
      } else if (e.vel !== 0) {
        e.pos += e.vel;
        e.vel *= FRICTION;
        if (Math.abs(e.vel) < 0.01) {
          e.vel = 0;
          e.target = restingPoint(e.pos, e.direction);
          settling = true;
        }
      } else if (e.pos !== Math.round(e.pos)) {
        e.target = restingPoint(e.pos, e.direction);
        settling = true;
      }
    }

    const pos = e.pos;
    const centreIndex = mod(Math.round(pos), n);
    let busy = e.dragging || settling || e.vel !== 0;
    let pending = null;
    let pendingScore = -1;

    // --- the photo in the middle ---
    // Only the two photos a change is between are ever drawn.
    for (let i = 0; i < n; i++) {
      const item = list[i];
      const d = wrapDelta(i, pos, n);
      const ad = d < 0 ? -d : d;
      const op = ad >= 1 ? 0 : smoothstep(clamp01((1 - ad) * CROSSFADE));

      if (op > 0 && !item.requested) {
        pendingScore = 2; // whatever is on screen comes before anything on the belt
        pending = item;
      }

      const frame = item.frame;
      if (!frame) continue;

      if (Math.abs(op - item.wroteFrameOp) > 0.004) {
        frame.style.opacity = op.toFixed(3);
        item.wroteFrameOp = op;
      }
      if (op > 0) {
        const scale = lerp(REST_SCALE, 1, clamp01(1 - ad));
        const transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`;
        if (transform !== item.wroteFrame) {
          frame.style.transform = transform;
          item.wroteFrame = transform;
        }
        // Whichever photo the belt's frame is over sits on top, so the pair
        // trades places exactly halfway through the change — where they are
        // both near-opaque and the trade cannot be seen.
        const z = i === centreIndex ? 20 : 10;
        if (z !== item.wroteFrameZ) {
          frame.style.zIndex = String(z);
          item.wroteFrameZ = z;
        }
      }
    }

    // --- the belt ---
    const period = belt.length;
    if (period) {
      const edge = e.reach + BELT_MARGIN;
      for (let k = 0; k < period; k++) {
        const slot = belt[k];
        const el = slot.el;
        const d = wrapDelta(k, pos, period);
        const ad = d < 0 ? -d : d;
        const off = ad > edge;

        if (!off && !slot.item.requested && pendingScore < 2) {
          const score = 1 / (1 + ad);
          if (score > pendingScore) {
            pendingScore = score;
            pending = slot.item;
          }
        }

        if (!el) continue;

        const op = off ? 0 : lerp(1, BELT_DIM, clamp01(ad / e.reach));
        if (Math.abs(op - slot.wroteOp) > 0.004) {
          el.style.opacity = op.toFixed(3);
          slot.wroteOp = op;
        }

        // A square that has left the belt keeps its last transform, so it would
        // otherwise sit invisibly under the marker and take the clicks meant
        // for the photo that is up.
        const hit = off ? 'none' : 'auto';
        if (hit !== slot.wroteHit) {
          el.style.pointerEvents = hit;
          slot.wroteHit = hit;
        }
        if (off) continue;

        const transform = `translate(-50%, -50%) translate3d(${(d * e.pitch).toFixed(2)}px, 0, 0)`;
        if (transform !== slot.wroteTransform) {
          el.style.transform = transform;
          slot.wroteTransform = transform;
        }
      }
    }

    if (pending) {
      busy = true;
      if (now - e.lastLoadAt > LOAD_INTERVAL && requestImage(pending)) {
        e.lastLoadAt = now;
      }
    }

    if (centreIndex !== e.centre) {
      e.centre = centreIndex;
      onCentreRef.current?.(list[centreIndex].photo);
    }

    return busy;
  }, [requestImage]);

  const kick = useCallback(() => {
    const e = engine.current;
    if (e.running) return;
    e.running = true;
    const step = () => {
      if (render() || e.dragging) {
        e.raf = requestAnimationFrame(step);
      } else {
        e.running = false;
        e.raf = 0;
      }
    };
    e.raf = requestAnimationFrame(step);
  }, [render]);

  /* ---------- lifecycle ---------- */

  useEffect(() => {
    const e = engine.current;
    measure();
    kick();

    // Photo boxes are cut from real aspect ratios, so resolve any still unknown
    // now rather than letting them re-flow under the pointer.
    preloadPhotos(photos, (jpg, aspect) => {
      const item = itemsRef.current.find((candidate) => candidate.photo.jpg === jpg);
      if (!item || item.aspect === aspect) return;
      item.aspect = aspect;
      item.wroteSize = -1;
      measure();
      kick();
    });

    const reveal = requestAnimationFrame(() => setShown(true));
    return () => {
      cancelAnimationFrame(reveal);
      cancelAnimationFrame(e.raf);
      e.running = false;
      e.raf = 0;
    };
  }, [measure, kick, photos]);

  // Squares that have just been added to the belt arrive unsized and unplaced.
  useEffect(() => {
    measure();
    kick();
  }, [slots, measure, kick]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => {
      measure();
      itemsRef.current.forEach((item) => { item.wroteFrame = ''; });
      slotsRef.current.forEach((slot) => { slot.wroteTransform = ''; });
      kick();
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [measure, kick]);

  /* ---------- interaction ---------- */

  const stepBy = useCallback((delta) => {
    const e = engine.current;
    if (delta === 0) return;
    e.target = Math.round(e.pos) + delta;
    e.direction = delta > 0 ? 1 : -1;
    e.vel = 0;
    kick();
  }, [kick]);

  // How far the pointer has to travel to turn over one photo. Dragging the big
  // photo is a long, deliberate pull; dragging the belt scrubs it, one square
  // under the pointer for one square of travel.
  const beginDrag = useCallback((event, perPhoto) => {
    const e = engine.current;
    e.dragging = true;
    e.dragMoved = 0;
    e.lastX = event.clientX;
    e.perPhoto = perPhoto;
    e.vel = 0;
    e.target = null;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    kick();
  }, [kick]);

  const onPhotoPointerDown = useCallback(
    (event) => beginDrag(event, DRAG_PER_PHOTO),
    [beginDrag]
  );

  const onBeltPointerDown = useCallback(
    (event) => beginDrag(event, engine.current.pitch),
    [beginDrag]
  );

  const onPointerMove = useCallback((event) => {
    const e = engine.current;
    if (!e.dragging) return;
    const dx = event.clientX - e.lastX;
    e.lastX = event.clientX;
    e.dragMoved += dx < 0 ? -dx : dx;
    const step = dx / Math.max(e.perPhoto, 1);
    if (step !== 0) e.direction = step < 0 ? 1 : -1;
    e.pos -= step;
    e.vel = e.vel * 0.75 - step * 0.25;
    kick();
  }, [kick]);

  const onPointerUp = useCallback((event) => {
    const e = engine.current;
    if (!e.dragging) return;
    e.dragging = false;
    e.vel *= 1.2;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    kick();
  }, [kick]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (event) => {
      const e = engine.current;
      event.preventDefault();
      // Summed, not whichever axis is larger: on a trackpad the dominant axis
      // flips between events in a slightly diagonal swipe, which reads as the
      // belt stuttering back and forth.
      const delta = event.deltaX + event.deltaY;
      if (delta === 0) return;
      e.target = null;
      e.vel = 0;
      e.direction = delta > 0 ? 1 : -1;
      e.pos += delta / WHEEL_PER_PHOTO;
      kick();
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [kick]);

  useEffect(() => {
    if (!active) return;
    const onKey = (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') stepBy(1);
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') stepBy(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, stepBy]);

  // Walk to the square that was clicked — the one on screen, not the nearest
  // other copy of the same photo.
  const onSlotClick = useCallback((k) => {
    const e = engine.current;
    if (e.dragMoved > DRAG_THRESHOLD) return;
    const period = slotsRef.current.length;
    if (!period) return;
    stepBy(Math.round(wrapDelta(k, e.pos, period)));
  }, [stepBy]);

  const onLoad = useCallback((item) => (event) => {
    const img = event.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      const aspect = img.naturalWidth / img.naturalHeight;
      if (item.aspect !== aspect) {
        item.aspect = aspect;
        item.wroteSize = -1;
        measure();
      }
    }
    img.dataset.loaded = 'true';
    kick();
  }, [measure, kick]);

  /* ---------- render ---------- */

  return (
    <S.Stage ref={stageRef} $active={active && shown}>
      <S.Surface
        $active={active}
        onPointerDown={onPhotoPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />

      <S.CentreBand ref={centreRef}>
        {items.map((item) => (
          <S.Frame key={item.photo.jpg} ref={item.setFrame}>
            <picture>
              <source ref={item.setFrameSource} type="image/webp" />
              <S.Photo
                ref={item.setFrameImg}
                alt={item.photo.subtitle ?? item.photo.title ?? ''}
                draggable={false}
                decoding="async"
                onLoad={onLoad(item)}
              />
            </picture>
          </S.Frame>
        ))}
      </S.CentreBand>

      <S.Belt
        ref={beltRef}
        $active={active}
        $visible={active && shown}
        onPointerDown={onBeltPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {slots.map((slot) => (
          <S.Square key={slot.k} ref={slot.setEl} onClick={() => onSlotClick(slot.k)}>
            <S.Thumb
              ref={slot.setImg}
              alt=""
              draggable={false}
              decoding="async"
              onLoad={onLoad(slot.item)}
              onError={fallBackToOriginal(slot.item.photo.jpg)}
            />
          </S.Square>
        ))}
        <S.Marker ref={markerRef} aria-hidden="true" />
      </S.Belt>
    </S.Stage>
  );
}

export default GalleryView;
