import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useMobileDetect from '~/hooks/useMobileDetect';
import useContent from '~/hooks/useContent';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import OptimizedImage from '~/components/OptimizedImage';
import CollectionModal from '~/components/CollectionModal';
import * as S from '~/pages/Work.styled';

/**
 * The gallery layout.
 *
 * The page is an imaginary four column grid: one column is exactly the width of
 * one landscape photo, and a vertical photo keeps that same width and simply
 * runs taller — every photo shows its own shape, nothing is cropped.
 *
 * The grid is laid out in rows. A row is as tall as the tallest thing in it, so
 * a vertical photo sets the bottom of its row, and the next row starts one gap
 * below that. The gap is the same value everywhere: between rows, between
 * columns, and down each side of the page.
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

const MIN_RUN = 2;          // photos between one blank spot and the next, fewest
const MAX_RUN = 5;          // and most
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

/** Small seeded PRNG, so a page's layout stays put until it is reloaded. */
const randomFrom = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Lay every photo out, dealing blank spots in between at random. */
const buildGrid = (photos, seed) => {
  const rand = randomFrom(seed);
  const runLength = () => MIN_RUN + Math.floor(rand() * (MAX_RUN - MIN_RUN + 1));

  const spots = [];
  let run = runLength();
  let since = 0;

  photos.forEach((photo, i) => {
    spots.push({ kind: 'photo', photo, number: i + 1 });
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
  const [displayText, setDisplayText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Drawn once per visit, so the blank spots do not move around under a rerender.
  const [layoutSeed] = useState(() => Math.floor(Math.random() * 2 ** 31));

  // Store initial mobile state for typing text (doesn't change on resize)
  const initialMobileRef = useRef(typeof window !== 'undefined' && window.innerWidth <= 768);

  // Every photo in every project, in project order, plus each project's hero.
  // Reel tiles and project covers are left out on purpose: they are re-exports
  // of these same shots under other filenames (the cover is the reel's crop of
  // the hero), so pulling them in shows several photos twice.
  const photos = useMemo(
    () =>
      projects.flatMap((project) =>
        [
          ...(project.photos ?? []).map((photo, index) => ({ photo, index })),
          // The hero is not in the project's own list, so a click on it opens
          // the collection at the top.
          { photo: project.hero, index: 0 },
        ]
          .filter(({ photo }) => photo?.jpg)
          .map(({ photo, index }, position) => ({
            jpg: photo.jpg,
            webp: photo.webp ?? null,
            alt: photo.alt ?? `${project.title} ${position + 1}`,
            slug: project.slug,
            photoIndex: index,
          }))
      ).filter((photo, i, all) => all.findIndex((p) => p.jpg === photo.jpg) === i),
    [projects]
  );

  const grid = useMemo(() => buildGrid(photos, layoutSeed), [photos, layoutSeed]);

  // A photo already in cache can finish before React has attached its onLoad,
  // and would then sit at zero opacity behind its placeholder for good. Mark
  // anything that arrived early, once, straight after the grid is laid out.
  useEffect(() => {
    document.querySelectorAll('figure img').forEach((img) => {
      if (img.complete && img.naturalWidth) img.dataset.loaded = 'true';
    });
  }, [grid]);

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

  useEffect(() => {
    // Use shorter text on mobile (based on initial load, not resize)
    const fullText = initialMobileRef.current ? "Here's my Work." : "Here's some of my Work.";
    const finalText = "Work";
    let currentIndex = 0;
    let isDeleting = false;
    let deleteIndex = fullText.length;

    const typeText = () => {
      if (!isDeleting && currentIndex <= fullText.length) {
        setDisplayText(fullText.substring(0, currentIndex));
        currentIndex++;
        if (currentIndex > fullText.length) {
          setTimeout(() => {
            isDeleting = true;
            typeText();
          }, 1000);
        } else {
          setTimeout(typeText, 50);
        }
      } else if (isDeleting && deleteIndex >= 0) {
        setDisplayText(fullText.substring(0, deleteIndex));
        deleteIndex--;
        if (deleteIndex < 0) {
          setTimeout(() => {
            let finalIndex = 0;
            const typeFinal = () => {
              if (finalIndex <= finalText.length) {
                setDisplayText(finalText.substring(0, finalIndex));
                finalIndex++;
                if (finalIndex > finalText.length) {
                  setIsTypingComplete(true);
                } else {
                  setTimeout(typeFinal, 80);
                }
              }
            };
            typeFinal();
          }, 200);
        } else {
          setTimeout(typeText, 30);
        }
      }
    };

    typeText();
  }, []); // Run only once on mount

  const renderSpot = (spot, index) => {
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
          >
            <OptimizedImage
              src={spot.photo.jpg}
              webpSrc={spot.photo.webp}
              alt={spot.photo.alt}
              onLoad={(event) => { event.currentTarget.dataset.loaded = 'true'; }}
            />
          </S.PhotoFrame>
          <S.PhotoCaption>{String(spot.number).padStart(2, '0')}</S.PhotoCaption>
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
          <S.PageTitle>
            {displayText}
            {!isTypingComplete && <S.Cursor>|</S.Cursor>}
          </S.PageTitle>
        </S.TitleFrame>
      </S.HeaderRow>

      <S.Content>
        <S.GalleryGrid>{grid.map(renderSpot)}</S.GalleryGrid>
      </S.Content>
      <Footer scrollReveal />
      {openPhoto && (
        <CollectionModal
          project={projectsBySlug.get(openPhoto.slug) ?? null}
          photoIndex={openPhoto.photoIndex ?? 0}
          onClose={closeCollection}
        />
      )}
    </S.Page>
  );
}

export default Work;
