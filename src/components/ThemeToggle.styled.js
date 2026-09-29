import styled, { css } from 'styled-components';

/* Dead centre of the header on desktop, clear of the nav's own layout; on
   narrow screens it joins the row between 02 and 03 instead. */
export const Slot = styled.div`
  position: absolute;
  inset: 0;
  padding-top: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  ${({ theme }) => theme.media.sm} {
    position: static;
    padding-top: 0;
  }
`;

const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

export const Button = styled.button`
  pointer-events: auto;
  background: none;
  border: none;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  -webkit-tap-highlight-color: transparent;

  svg {
    display: block;
    overflow: visible;
  }

  /* Only the animated parts: the rays' own rotate() attributes already turn
     about the centre, and a CSS origin would shift them a second time. */
  .core,
  .rays,
  .bite {
    transform-box: view-box;
    transform-origin: 16px 16px;
  }

  /* Resting: a small dot. */
  .core {
    fill: currentColor;
    transform: scale(0.72);
    transition: transform 0.45s ${ease};
  }

  .rays {
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    opacity: 0;
    transform: scale(0.5) rotate(-60deg);
    transition: opacity 0.3s ease, transform 0.5s ${ease};
  }

  /* The bite that makes the moon waits off to the upper right. */
  .bite {
    transform: translate(14px, -14px);
    transition: transform 0.6s ${ease};
  }

  &:focus-visible {
    outline: 1px solid currentColor;
    outline-offset: 4px;
    border-radius: 50%;
  }

  /* Night, pointer over it: the dot becomes a sun. */
  ${({ $isDay }) => !$isDay && css`
    @media (hover: hover) {
      &:hover .core {
        transform: scale(0.62);
      }

      &:hover .rays {
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }
    }
  `}

  /* Day: a full-size disc with the bite slid in over it — a crescent. */
  ${({ $isDay }) => $isDay && css`
    .core {
      transform: scale(0.9);
    }

    .bite {
      transform: translate(4px, -3.5px);
    }
  `}
`;
