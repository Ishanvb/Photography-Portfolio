import { useId } from 'react';
import { useThemeMode } from '~/styles/themeMode';
import * as S from '~/components/ThemeToggle.styled';

const RAYS = Array.from({ length: 8 }, (_, i) => i * 45);

/**
 * The day/night switch in the middle of the header.
 *
 * At night it is a small dot in the text colour, which grows rays and becomes a
 * sun under the pointer (the cursor is absorbed into it). By day the same dot
 * has a bite taken out of it by a sliding mask and becomes a crescent moon; the
 * cursor rings it instead. Everything is one SVG so each state morphs into the
 * next rather than swapping.
 */
function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const maskId = `moon-${useId().replace(/:/g, '')}`;
  const isDay = mode === 'light';

  return (
    <S.Slot>
      <S.Button
        type="button"
        $isDay={isDay}
        onClick={toggleMode}
        aria-label={isDay ? 'Switch to night mode' : 'Switch to day mode'}
        data-cursor-toggle={isDay ? 'moon' : 'sun'}
      >
        <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
          <defs>
            <mask id={maskId}>
              <rect width="32" height="32" fill="#fff" />
              <circle className="bite" cx="16" cy="16" r="6" fill="#000" />
            </mask>
          </defs>
          <g className="rays">
            {RAYS.map((angle) => (
              <line
                key={angle}
                x1="16" y1="5.5" x2="16" y2="2.5"
                transform={`rotate(${angle} 16 16)`}
              />
            ))}
          </g>
          <circle className="core" cx="16" cy="16" r="7" mask={`url(#${maskId})`} />
        </svg>
      </S.Button>
    </S.Slot>
  );
}

export default ThemeToggle;
