import { use, useSyncExternalStore } from 'react';
import { contentReady, getContent, subscribe } from '~/content';

/**
 * The content manifest. Suspends briefly on first load (see content/index.js),
 * then re-renders if fresher data arrives afterwards. Never throws.
 */
export default function useContent() {
  use(contentReady);
  return useSyncExternalStore(subscribe, getContent);
}
