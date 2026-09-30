import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useMobileDetect from '~/hooks/useMobileDetect';
import useContent from '~/hooks/useContent';
import Header from '~/components/Header';
import { ContactStage } from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import CollectionModal from '~/components/CollectionModal';
import { collectionOf, photoAspects, preloadPhotos, rememberShapes } from '~/content/photos';
import * as S from '~/pages/Work.styled';

/**
 * The gallery layout.
 *
 * The page is an imaginary four column grid: one column is exactly the width of
 * one landscape photo, and a vertical photo keeps that same width and simply
 * runs taller — every photo shows its own shape, nothing is cropped.
 *
 * The columns are not tied together in rows: each one is a stack, and every
 * spot drops into whichever column is shortest so far, one gap below the spot
 * above it. So a vertical photo never leaves a hole beside it — the columns
 * just run down at their own pace. The gap is the same value everywhere:
 * between spots, between columns, and down each side of the page.
 *
 * Every photo in the site gets a spot, in order. Blank spots are dealt out
 * between them at random — never two in a row, and always outnumbered by the
 * photos. Nearly all of them carry a small cluster of dots; the odd one is left
 * bare. Every blank spot is the shape of a horizontal photo.
 */

/** A dropdown row's label, with letters that roll down one after another. */
const AnimatedCategoryLabel = ({ text }) => (
  <S.AnimatedCategory>
    {[...text].map((char, i) => (
      <S.Letter key={i} style={{ transitionDelay: `${i * 35}ms` }}>
        <S.LetterStack>
          <span>{char === ' ' ? '\u00A0' : char}</span>
          <span>{char === ' ' ? '\u00A0' : char}</span>
        </S.LetterStack>
      </S.Letter>
    ))}
  </S.AnimatedCategory>
);

/**
 * The title types itself out, deletes itself, and settles on "Work". Its own
 * component, so the forty-odd keystrokes re-render the title and nothing else
 * — not the whole grid under it.
 */
function TypedTitle({ onDone }) {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Shorter on a phone (as the page first loads, not on resize).
    const fullText = window.innerWidth <= 768 ? "Here's my Work." : "Here's some of my Work.";
    const finalText = 'Work';
    const steps = [];
    for (let i = 0; i <= fullText.length; i++) steps.push([fullText.slice(0, i), 50]);
    steps[steps.length - 1][1] = 1000;
    for (let i = fullText.length; i >= 0; i--) steps.push([fullText.slice(0, i), 30]);
    steps[steps.length - 1][1] = 200;
    for (let i = 0; i <= finalText.length; i++) steps.push([finalText.slice(0, i), 80]);
    steps[steps.length - 1][1] = 0;

    let timer;
    const next = (k) => {
      if (k === steps.length) {
        setDone(true);
        onDone();
        return;
      }
      setText(steps[k][0]);
      timer = setTimeout(() => next(k + 1), steps[k][1]);
    };
    next(0);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <S.PageTitle>
      {text}
      {!done && <S.Cursor>|</S.Cursor>}
    </S.PageTitle>
  );
}

const MIN_RUN = 5;          // photos between one blank spot and the next, fewest
const MAX_RUN = 10;         // and most
const CIRCLE_CHANCE = 0.92; // share of blank spots that carry dots; a bare gap is rare

/**
 * Where a cluster's dots sit, as fractions of its box — one fixed arrangement
 * per count rather than a scatter, so a gap always reads as a deliberate shape.
 * Every layout lives inside the same box, and that box is the size of the lone
 * circle, so a cluster of six occupies exactly the area one circle would. Six is
 * the ring: two across the top, one either side, two along the bottom.
 */
const LAYOUTS = [
  [[0.5, 0.5]],
  [[0.28, 0.5], [0.72, 0.5]],
  [[0.5, 0.18], [0.78, 0.66], [0.22, 0.66]],
  [[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]],
  [[0.27, 0.27], [0.73, 0.27], [0.5, 0.5], [0.27, 0.73], [0.73, 0.73]],
  [[0.33, 0.21], [0.67, 0.21], [0.16, 0.5], [0.84, 0.5], [0.33, 0.79], [0.67, 0.79]]
];

// Columns across, by screen width — matches the breakpoints in Work.styled.js.
const columnsFor = (width) => (width <= 480 ? 1 : width <= 768 ? 2 : 4);

const EMPTY_ASPECT = 3 / 2;   // a blank spot is the shape of a horizontal photo
const UNKNOWN_ASPECT = 3 / 2; // a photo whose shape has not arrived yet
// The gap below a spot, as a share of a column's width — close enough to
// keep the columns' ends level.
const SPOT_EXTRA = 0.1;
// How long to hold the grid back for a photo shape nobody knew in advance,
// before laying it out anyway.
const SHAPE_WAIT = 1500;

/**
 * Deal the spots into columns: each one goes to whichever column is shortest
 * so far, so the columns stay level without being tied into rows. Heights are
 * in units of a column's width, from each photo's real shape.
 */
const packColumns = (spots, count, aspectOf) => {
  const columns = Array.from({ length: count }, () => ({ height: 0, spots: [] }));
  spots.forEach((spot, index) => {
    const aspect = spot.kind === 'photo' ? aspectOf(spot.photo.jpg) : EMPTY_ASPECT;
    const shortest = columns.reduce((best, column) => (column.height < best.height - 1e-6 ? column : best));
    shortest.spots.push({ spot, index, aspect });
    shortest.height += 1 / aspect + SPOT_EXTRA;
  });
  return columns.map((column) => column.spots);
};

/** Small seeded PRNG, so a page's layout stays put until it is reloaded. */
const randomFrom = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/**
 * How a photo's frame lies behind it, like a stamp put down by hand: each sits
 * a touch off square, never far. The photo itself stays straight.
 */
const stampLie = (rand) => {
  const spread = (max) => (rand() * 2 - 1) * max;
  return { tilt: spread(0.7), dx: spread(2), dy: spread(2) };
};

/** Lay every photo out, dealing blank spots in between at random. */
const buildGrid = (photos, seed) => {
  const rand = randomFrom(seed);
  const runLength = () => MIN_RUN + Math.floor(rand() * (MAX_RUN - MIN_RUN + 1));

  const spots = [];
  let run = runLength();
  let since = 0;

  photos.forEach((photo, i) => {
    spots.push({ kind: 'photo', photo, lie: stampLie(rand) });
    since += 1;

    // Never trail the grid with a blank spot.
    if (since >= run && i < photos.length - 1) {
      // Nearly every blank spot carries a cluster of dots. How many is the only
      // thing left to chance — the arrangement of that many is fixed.
      const count = rand() < CIRCLE_CHANCE ? 1 + Math.floor(rand() * LAYOUTS.length) : 0;
      spots.push({ kind: 'empty', circles: count || null });
      since = 0;
      run = runLength();
    }
  });

  return spots;
};

function Work() {
  const { projects } = useContent();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMobileDetect();
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const finishTyping = useCallback(() => setIsTypingComplete(true), []);

  // Drawn once per visit, so the blank spots do not move around under a rerender.
  const [layoutSeed] = useState(() => Math.floor(Math.random() * 2 ** 31));

  // Every photo in every project's collection (its photos plus its hero), in
  // project order. Reel tiles and project covers are left out on purpose: they
  // are re-exports of these same shots under other filenames (the cover is the
  // reel's crop of the hero), so pulling them in shows several photos twice.
  //
  // A tile opens its collection by file, not by position: the pop-up looks the
  // jpg up in the same collectionOf() list, so the photo clicked is always the
  // photo shown.
  const photos = useMemo(() => {
    rememberShapes(projects.flatMap(collectionOf));
    return projects.flatMap((project) =>
      collectionOf(project)
        .filter((photo) => photo.jpg)
        .map((photo, position) => ({
          jpg: photo.jpg,
          webp: photo.webp ?? null,
          alt: photo.alt ?? `${project.title} ${position + 1}`,
          slug: project.slug,
        }))
    ).filter((photo, i, all) => all.findIndex((p) => p.jpg === photo.jpg) === i);
  }, [projects]);

  const grid = useMemo(() => buildGrid(photos, layoutSeed), [photos, layoutSeed]);

  const [columnCount, setColumnCount] = useState(() =>
    columnsFor(typeof window === 'undefined' ? 1440 : window.innerWidth)
  );
  useEffect(() => {
    const onResize = () => setColumnCount(columnsFor(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Which column a spot lands in depends on the heights above it, so the grid
  // is dealt from every photo's shape. Nearly always they are all known up
  // front (built into the site, or stored with the upload); anything that is
  // not is measured from its small copy, holding the grid back a moment at
  // most. Bumped as each one arrives.
  const [shapesVersion, setShapesVersion] = useState(0);
  const [shapesWaited, setShapesWaited] = useState(false);
  const shapesKnown = photos.every((photo) => photoAspects.has(photo.jpg));

  // Shapes tend to land in bursts, so they are gathered up and the grid is
  // re-dealt at most once a frame rather than once a photo.
  useEffect(() => {
    let frame = 0;
    preloadPhotos(photos, () => {
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        setShapesVersion((v) => v + 1);
      });
    });
    const timer = setTimeout(() => setShapesWaited(true), SHAPE_WAIT);
    return () => {
      cancelAnimationFrame(frame);
      frame = -1; // anything still arriving after this is ignored
      clearTimeout(timer);
    };
  }, [photos]);

  const aspectOf = useCallback((jpg) => photoAspects.get(jpg) ?? UNKNOWN_ASPECT, []);
  const layoutReady = shapesKnown || shapesWaited;

  const columns = useMemo(
    () => (layoutReady ? packColumns(grid, columnCount, aspectOf) : []),
    // shapesVersion: re-deal as late shapes arrive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grid, columnCount, aspectOf, layoutReady, shapesVersion]
  );

  // A photo already in cache can finish before React has attached its onLoad,
  // and would then sit at zero opacity behind its placeholder for good. Mark
  // anything that arrived early, once, straight after the grid is laid out.
  useEffect(() => {
    document.querySelectorAll('figure img').forEach((img) => {
      if (img.complete && img.naturalWidth) img.dataset.loaded = 'true';
    });
  }, [columns]);

  const projectsBySlug = useMemo(
    () => new Map(projects.map((project) => [project.slug, project])),
    [projects]
  );

  // Clicking a photo opens its whole collection over the page. Arriving from
  // the reel opens one straight away — and the history entry is rewritten as it
  // opens, so closing it leaves Work behind rather than reopening on a reload.
  const [openPhoto, setOpenPhoto] = useState(() => location.state?.openCollection ?? null);
  const closeCollection = useCallback(() => setOpenPhoto(null), []);

  useEffect(() => {
    if (!location.state?.openCollection) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  // The projects list. Picking one opens that collection from the top.
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownReady, setDropdownReady] = useState(false);

  const openProject = useCallback((slug) => {
    setDropdownOpen(false);
    setOpenPhoto({ slug, photoIndex: 0 });
  }, []);

  // The arrow only becomes a magnetic cursor target once it has faded in.
  useEffect(() => {
    if (!isTypingComplete) return;
    const timer = setTimeout(() => setDropdownReady(true), 800);
    return () => clearTimeout(timer);
  }, [isTypingComplete]);


  // The grid only changes when the layout does, so opening the projects list
  // or a collection does not re-render every tile under it.
  const gallery = useMemo(() => {
    const renderSpot = ({ spot, index, aspect }) => {
      if (spot.kind === 'photo' && spot.photo) {
        return (
          <S.PhotoSpot key={index} $index={index}>
            <S.PhotoFrame
              as="button"
              type="button"
              onClick={() => setOpenPhoto(spot.photo)}
              aria-label={`Open the ${projectsBySlug.get(spot.photo.slug)?.title ?? ''} collection`}
              data-cursor="open"
              data-cursor-variant="merge"
              style={{
                '--lie': `translate(${spot.lie.dx}px, ${spot.lie.dy}px) rotate(${spot.lie.tilt}deg)`,
              }}
            >
              <S.InkLeak aria-hidden="true" />
              <S.Backing aria-hidden="true" />
              <OptimizedImage
                src={spot.photo.jpg}
                webpSrc={spot.photo.webp}
                alt={spot.photo.alt}
                maxWidth={1080}
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 25vw"
                style={{ aspectRatio: `auto ${aspect}` }}
                onLoad={(event) => { event.currentTarget.dataset.loaded = 'true'; }}
              />
              <S.StampEdge aria-hidden="true" />
              <S.PhotoLeak aria-hidden="true" />
            </S.PhotoFrame>
          </S.PhotoSpot>
        );
      }

      return (
        <S.EmptySpot key={index} $index={index}>
          {spot.circles && (
            <S.Circles>
              {LAYOUTS[spot.circles - 1].map(([cx, cy], i) => (
                <S.Circle
                  key={i}
                  $solo={spot.circles === 1}
                  style={{ left: `${cx * 100}%`, top: `${cy * 100}%` }}
                />
              ))}
            </S.Circles>
          )}
        </S.EmptySpot>
      );
    };

    return columns.map((column, i) => (
      <S.GalleryColumn key={i}>{column.map(renderSpot)}</S.GalleryColumn>
    ));
  }, [columns, projectsBySlug]);

  return (
    <S.Page>
      <Header />
      <S.HeaderRow>
        <S.CategoryDropdown
          $isOpen={dropdownOpen}
          $isVisible={isTypingComplete}
          data-category-dropdown={dropdownOpen ? 'open' : 'closed'}
        >
          {/* On a phone the whole row toggles; on a pointer only the arrow does,
              so the title itself stays a plain heading. */}
          <S.CategoryItem onClick={isMobile ? () => setDropdownOpen((o) => !o) : undefined}>
            <S.CategoryText>Projects</S.CategoryText>
            <S.CategoryArrow
              as="button"
              type="button"
              aria-label={dropdownOpen ? 'Hide the projects' : 'Show the projects'}
              aria-expanded={dropdownOpen}
              $isOpen={dropdownOpen}
              onClick={!isMobile ? () => setDropdownOpen((o) => !o) : undefined}
              {...(dropdownReady && !isMobile && { 'data-cursor-magnet': true })}
            />
          </S.CategoryItem>

          <S.CategoryLine />

          <S.DropdownItems>
            {projects.map((project, index) => (
              <S.DropdownItem
                key={project.slug}
                type="button"
                onClick={() => openProject(project.slug)}
              >
                <S.CategoryText as="span">
                  <AnimatedCategoryLabel text={`P${index + 1} ${project.title}`} />
                </S.CategoryText>
              </S.DropdownItem>
            ))}
          </S.DropdownItems>
        </S.CategoryDropdown>

        <S.TitleFrame>
          <TypedTitle onDone={finishTyping} />
        </S.TitleFrame>
      </S.HeaderRow>

      <S.Content>
        <S.GalleryGrid>{gallery}</S.GalleryGrid>
      </S.Content>
      <ContactStage />
      {openPhoto && (
        <CollectionModal
          project={projectsBySlug.get(openPhoto.slug) ?? null}
          jpg={openPhoto.jpg}
          photoIndex={openPhoto.photoIndex ?? 0}
          onClose={closeCollection}
        />
      )}
    </S.Page>
  );
}

export default Work;
