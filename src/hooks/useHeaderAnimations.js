import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetHeaderAnimations, setHeaderAnimationsBatch } from '~/store/animationSlice';

/**
 * Shared hook replacing the duplicated headerAnimations useState + useEffect
 * pattern across all 6 project pages.
 *
 * Resets animations on mount, then staggers them at 100ms / 250ms.
 */
export default function useHeaderAnimations(deps = []) {
  const dispatch = useDispatch();
  const headerAnimations = useSelector((state) => state.animation.headerAnimations);

  useEffect(() => {
    dispatch(resetHeaderAnimations());

    const t1 = setTimeout(() => {
      dispatch(setHeaderAnimationsBatch({ date: true, image: true, body: true }));
    }, 100);

    const t2 = setTimeout(() => {
      dispatch(setHeaderAnimationsBatch({ title: true }));
    }, 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return headerAnimations;
}
