import { useEffect, useRef, useState } from 'react';
import * as S from '~/components/Title.styled';
import { CHANGE_MS, TICK_MS, frameAt, settled, settleTimes } from '~/components/titleScramble';

const NAME = 'MariannaParzick';
const INTRO = "Hi, I'm MariannaParzick.";
const WORD = 'collection';

/**
 * Opening the gallery rewrites the title rather than swapping it: see
 * titleScramble.js for the roll itself. While it runs, the letters that will
 * become the collection's name are covered by a highlight wiping in from the
 * left.
 */

/* =========================
   Component
========================= */

function Title({ startAnimation = true, gallery = false, project = '' }) {
  const [introText, setIntroText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  // Once the gallery has been opened the title is no longer the typed name but
  // whatever the last change left behind.
  const [run, setRun] = useState(null); // { cells, nameStart }
  const [highlighted, setHighlighted] = useState(false);

  const changingRef = useRef(false);
  // Set the first time the gallery rewrites the title; the opening type-out
  // never gets it back.
  const takenOverRef = useRef(false);
  const projectRef = useRef(project);
  // The gallery state the title last showed. The change runs only when that
  // actually flips — not on mount, and not when React's development mode runs
  // the effect a second time (which used to roll the title straight to the
  // name locally, so the opening type-out never showed there).
  const shownGalleryRef = useRef(gallery);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  /* ---------- the opening type-out ---------- */

  useEffect(() => {
    if (!startAnimation) return;

    const TYPE = 60;    // ms a letter takes to appear
    const DELETE = 30;  // ...and to disappear again
    const HOLD = 500;   // the pause on the full greeting
    const GAP = 200;    // ...and on the empty line before the name

    // The whole opening as one list of [what to show, how long to hold it], so
    // it runs off a single timer that the cleanup can always cancel.
    const script = [];
    for (let i = 1; i <= INTRO.length; i++) {
      script.push([INTRO.slice(0, i), i === INTRO.length ? HOLD : TYPE]);
    }
    for (let i = INTRO.length - 1; i >= 0; i--) {
      script.push([INTRO.slice(0, i), i === 0 ? GAP : DELETE]);
    }
    for (let i = 1; i <= NAME.length; i++) script.push([NAME.slice(0, i), TYPE]);

    let step = 0;
    let timer = 0;
    const run = () => {
      // The gallery may have taken the title over mid-sentence; nothing this
      // writes would be shown, so stop rather than re-render for no reason.
      if (takenOverRef.current) return;
      const [text, hold] = script[step++];
      setIntroText(text);
      if (step < script.length) timer = setTimeout(run, hold);
      else setShowCursor(false);
    };
    timer = setTimeout(run, TYPE);

    return () => clearTimeout(timer);
  }, [startAnimation]);

  /* ---------- the change ---------- */

  useEffect(() => {
    // The opening type-out owns the title until the gallery is first opened.
    if (gallery === shownGalleryRef.current) return;
    shownGalleryRef.current = gallery;

    const nameStart = gallery ? WORD.length : null;
    let target = gallery ? `${WORD}${projectRef.current}` : NAME;
    let settleAt = settleTimes(target.length);
    const started = performance.now();

    changingRef.current = true;
    takenOverRef.current = true;
    setHighlighted(gallery);
    setShowCursor(false);

    let timer = 0;
    const tick = () => {
      // The gallery reports which collection it landed on a frame or two after
      // it opens, so the target is re-read rather than captured up front.
      const wanted = gallery ? `${WORD}${projectRef.current}` : NAME;
      if (wanted !== target) {
        if (wanted.length !== target.length) settleAt = settleTimes(wanted.length);
        target = wanted;
      }

      const p = Math.min(1, (performance.now() - started) / CHANGE_MS);
      setRun({ cells: p < 1 ? frameAt(target, settleAt, p) : settled(target), nameStart });

      if (p < 1) timer = setTimeout(tick, TICK_MS);
      else changingRef.current = false;
    };
    tick();

    return () => {
      clearTimeout(timer);
      changingRef.current = false;
    };
  }, [gallery]);

  // Scrolling from one collection to the next inside the gallery is a swap, not
  // another rewrite — the name changes, the title does not roll again.
  useEffect(() => {
    if (!gallery || changingRef.current) return;
    setRun({ cells: settled(`${WORD}${project}`), nameStart: WORD.length });
  }, [gallery, project]);

  /* ---------- render ---------- */

  const cells = run?.cells ?? settled(introText);
  const nameStart = run?.nameStart ?? null;
  const plain = nameStart === null ? cells : cells.slice(0, nameStart);
  const named = nameStart === null ? [] : cells.slice(nameStart);

  // What the line actually reads, for anything that cannot see the cells.
  const label = gallery ? `collection ${project}` : run ? NAME : introText;

  return (
    <S.Container data-node-id="35:19" data-title-anchor="">
      <S.Line $isTyping={showCursor} data-node-id="1:4" aria-label={label}>
        <S.Plain aria-hidden="true">{plain.map(renderCell)}</S.Plain>
        {named.length > 0 && (
          <S.Name aria-hidden="true">
            <S.NameBase>{named.map(renderCell)}</S.NameBase>
            <S.NameCover $in={highlighted}>
              <S.NameInk>{named.map(renderCell)}</S.NameInk>
            </S.NameCover>
          </S.Name>
        )}
      </S.Line>
    </S.Container>
  );
}

/** A letter: the one that belongs here sets the width, the one showing sits over it. */
function renderCell(cell, index) {
  const shown = cell.char === ' ' ? ' ' : cell.char;
  const reserved = cell.final === ' ' ? ' ' : cell.final;
  return (
    <S.Cell key={index} $boxed={cell.boxed}>
      <S.CellSizer>{reserved}</S.CellSizer>
      <S.CellGlyph>{shown}</S.CellGlyph>
    </S.Cell>
  );
}

export default Title;
