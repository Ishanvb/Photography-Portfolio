import { useEffect, useState } from 'react';
import * as T from '~/components/Title.styled';
import { CHANGE_MS, TICK_MS, frameAt, settled, settleTimes } from '~/components/titleScramble';

/**
 * A word that arrives, and changes, the way the home page title does: every
 * letter rolls through random glyphs and boxes before settling (see
 * titleScramble.js). Showing it rolls it in from nothing; changing `text`
 * rolls it into the new word; hiding it just clears it.
 */
function ScrambleText({ text, visible = true, as, className }) {
  const [cells, setCells] = useState(null);

  useEffect(() => {
    if (!visible) return;

    const settleAt = settleTimes(text.length);
    const started = performance.now();
    let timer = 0;

    const tick = () => {
      const p = Math.min(1, (performance.now() - started) / CHANGE_MS);
      setCells(p < 1 ? frameAt(text, settleAt, p) : settled(text));
      if (p < 1) timer = setTimeout(tick, TICK_MS);
    };
    tick();

    return () => {
      clearTimeout(timer);
      setCells(null);
    };
  }, [text, visible]);

  const Tag = as ?? 'span';

  return (
    <Tag className={className} aria-label={text}>
      <span aria-hidden="true">
        {(cells ?? []).map((cell, index) => (
          <T.Cell key={index} $boxed={cell.boxed}>
            <T.CellSizer>{cell.final}</T.CellSizer>
            <T.CellGlyph>{cell.char}</T.CellGlyph>
          </T.Cell>
        ))}
      </span>
    </Tag>
  );
}

export default ScrambleText;
