import { use } from 'react';
import { contentPromise } from '~/content';

/** Suspends until the content manifest is available. Never throws. */
export default function useContent() {
  return use(contentPromise);
}
