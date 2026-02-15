import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
  width: 296px;
  height: 22px;

  ${({ theme }) => theme.media.sm} {
    width: 160px;
    height: 14px;
  }

  ${({ theme }) => theme.media.xs} {
    width: 140px;
    height: 12px;
  }
`;

export const Rectangle = styled.div`
  position: absolute;
  width: 46px;
  height: 22px;
  background-color: ${({ theme }) => theme.colors.transparent};
  border: 1px solid ${({ theme }) => theme.colors.text};
  cursor: grab;
  z-index: 2;
  pointer-events: auto;
  box-sizing: border-box;

  &:active {
    cursor: grabbing;
  }

  ${({ theme }) => theme.media.sm} {
    width: 26px;
    height: 14px;
  }

  ${({ theme }) => theme.media.xs} {
    width: 22px;
    height: 12px;
  }
`;

export const LinesContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  ${({ theme }) => theme.media.sm} {
    width: 160px;
    overflow: hidden;
  }

  ${({ theme }) => theme.media.xs} {
    width: 140px;
  }
`;

export const Line = styled.div`
  position: absolute;
  width: 0;
  height: 22px;
  border-left: 1px solid ${({ theme }) => theme.colors.text};
  z-index: 1;
  transition: opacity 0.1s ease;

  ${({ theme }) => theme.media.sm} {
    height: 14px;
  }

  ${({ theme }) => theme.media.xs} {
    height: 12px;
  }
`;

export const FixedWrapper = styled.div`
  position: fixed;
  bottom: 5vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: ${({ theme }) => theme.zIndex.scrollReel};
  pointer-events: auto;

  ${({ theme }) => theme.media.heightTall} {
    bottom: 50px;
  }

  ${({ theme }) => theme.media.heightMedTall} {
    bottom: 40px;
  }

  ${({ theme }) => theme.media.heightMed} {
    bottom: 30px;
  }

  ${({ theme }) => theme.media.heightShort} {
    bottom: 20px;
  }

  ${({ theme }) => theme.media.heightVeryShort} {
    bottom: 15px;
  }

  ${({ theme }) => theme.media.sm} {
    bottom: 24px;
    left: 50%;
    right: auto;
    margin-left: 0;
    margin-right: 0;
    transform: translateX(-50%);
  }

  ${({ theme }) => theme.media.xs} {
    bottom: 20px;
  }
`;
