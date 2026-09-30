import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { collectionOf, photoAspects } from '~/content/photos';
import * as S from './CollectionModal.styled';

// How long the panel takes to fade out, so it is still on screen while it does.
const EXIT_MS = 300;

const NOMINAL_ASPECT = 1.5;
const VIDEO_ASPECT = 16 / 9;

/**
 * What shape a photo's box should be. Its own dimensions if the manifest knows
 * them, otherwise whatever the gallery measured while preloading, otherwise a
 * stand-in — every one of which is settled before the file loads, so the stack
 * never re-flows under the reader mid-scroll.
 */
const aspectOf = (photo) => {
  if (photo.youtubeId) return VIDEO_ASPECT;
  if (photo.width && photo.height) return photo.width / photo.height;
  return photoAspects.get(photo.jpg) ?? NOMINAL_ASPECT;
};

/**
 * One project, as a pop-up over the Work page: its photos stacked down a panel
 * at one shared width, each with the row beneath it carrying its caption and
 * its number. Opens scrolled to whichever photo was clicked.
 *
 * `jpg` names the photo to open on, and wins when given — it is looked up in
 * the same collectionOf() list the Work grid is built from, so it cannot drift
 * onto a neighbour. `photoIndex` is for callers that only have a position (the
 * reel's targetPhotoIndex, an index into project.photos).
 */
function CollectionModal({ project, jpg = null, photoIndex = 0, onClose }) {
  const [shown, setShown] = useState(false);
  const scrollRef = useRef(null);
  const headRef = useRef(null);
  const blocksRef = useRef([]);
  const closingRef = useRef(false);

  const photos = collectionOf(project);
  const found = jpg ? photos.findIndex((photo) => photo.jpg === jpg) : -1;
  const startIndex = found >= 0 ? found : photoIndex;

  // Fade out first, then let the parent drop us.
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setShown(false);
    setTimeout(onClose, EXIT_MS);
  }, [onClose]);

  useEffect(() => {
    const reveal = requestAnimationFrame(() => setShown(true));
    scrollRef.current?.focus({ preventScroll: true });
    return () => cancelAnimationFrame(reveal);
  }, []);

  // Land on the photo that was clicked, with the row above it in view. Every
  // box is already the right shape, so this lands correctly the first time and
  // does not need redoing as the files arrive.
  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    const block = blocksRef.current[startIndex];
    if (!scroll || !block) return;
    const row = headRef.current?.offsetHeight ?? 0;
    scroll.scrollTop = Math.max(0, block.offsetTop - row);
  }, [startIndex]);

  // The page underneath is a long scrolling grid — hold it still, and pay back
  // the width of the scrollbar so it does not jump sideways as it goes.
  useEffect(() => {
    const { body } = document;
    const overflow = body.style.overflow;
    const padding = body.style.paddingRight;
    const bar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (bar > 0) body.style.paddingRight = `${bar}px`;
    return () => {
      body.style.overflow = overflow;
      body.style.paddingRight = padding;
    };
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [requestClose]);

  if (!project) return null;

  // Only a click that lands on the backdrop itself counts as "outside".
  const onBackdropClick = (event) => {
    if (event.target === event.currentTarget) requestClose();
  };

  /**
   * A photo's real shape, learnt the moment its file lands. Nothing warms the
   * aspect map before the Work page opens one of these, so most photos start on
   * the stand-in ratio and have to be put right here — and a photo that changes
   * height above the fold is pushed back out of the way, so the correction
   * never drags the page under the reader.
   */
  const onPhotoLoad = (photo) => (event) => {
    const img = event.currentTarget;
    img.dataset.loaded = 'true';

    const { naturalWidth: w, naturalHeight: h } = img;
    if (!w || !h) return;
    const aspect = w / h;
    const shot = img.closest('[data-shot]');
    const scroll = scrollRef.current;
    // Read what the box was cut from before recording the real shape, or the
    // two always agree and the box is never put right.
    const assumed = aspectOf(photo);
    photoAspects.set(photo.jpg, aspect);
    if (!shot || !scroll || Math.abs(assumed - aspect) < 0.001) return;

    const before = shot.offsetHeight;
    const above = shot.offsetTop < scroll.scrollTop;
    shot.style.setProperty('--ar', String(aspect));
    const delta = shot.offsetHeight - before;
    if (delta && above) scroll.scrollTop += delta;
  };

  return (
    <S.Backdrop $shown={shown} onClick={onBackdropClick}>
      <S.Panel
        $shown={shown}
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} collection`}
      >
        {/* Focusable so the arrow keys scroll the collection — the gallery
            behind it has given up the keyboard for as long as this is open. */}
        <S.Scroll ref={scrollRef} tabIndex={0}>
          {/* Every block is the same width, so the head row lines up with the
              photos the same way each caption row does. */}
          <S.Block ref={headRef}>
            <S.Row>
              <S.Label>
                <S.LabelWord>collection</S.LabelWord>
                <S.LabelValue>{project.title}</S.LabelValue>
              </S.Label>
              <S.DateText>{project.dateLabel?.trim() || 'present'}</S.DateText>
            </S.Row>
          </S.Block>

          {photos.map((photo, index) => (
            <S.Block
              key={photo.jpg ?? photo.youtubeId ?? index}
              ref={(el) => { blocksRef.current[index] = el; }}
            >
              <S.Shot data-shot style={{ '--ar': String(aspectOf(photo)) }}>
                {photo.youtubeId ? (
                  <S.Video
                    src={`https://www.youtube-nocookie.com/embed/${photo.youtubeId}`}
                    title={photo.alt || `${project.title} ${index + 1}`}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <picture>
                    {photo.webp && <source srcSet={photo.webp} type="image/webp" />}
                    <S.Photo
                      src={photo.jpg}
                      alt={photo.alt || `${project.title} ${index + 1}`}
                      draggable={false}
                      decoding="async"
                      loading={Math.abs(index - startIndex) > 1 ? 'lazy' : undefined}
                      onLoad={onPhotoLoad(photo)}
                    />
                  </picture>
                )}
              </S.Shot>

              <S.Row>
                <S.Caption>{photo.caption?.trim() || photo.alt || ''}</S.Caption>
                <S.Number>{String(index + 1).padStart(2, '0')}</S.Number>
              </S.Row>
            </S.Block>
          ))}
        </S.Scroll>
      </S.Panel>
    </S.Backdrop>
  );
}

export default CollectionModal;
