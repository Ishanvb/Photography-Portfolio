import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMobile } from '~/store/uiSlice';

/**
 * Shared hook for mobile detection. Dispatches setMobile on resize,
 * returns isMobile from Redux selector.
 */
export default function useMobileDetect() {
  const dispatch = useDispatch();
  const isMobile = useSelector((state) => state.ui.isMobile);

  useEffect(() => {
    const checkMobile = () => {
      dispatch(setMobile(window.innerWidth <= 768));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [dispatch]);

  return isMobile;
}
