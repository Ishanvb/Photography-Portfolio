import { use } from 'react';
import { contentPromise } from '~/content';

/** Suspends until the content manifest is available. Never throws. */
export default function useContent() {
  return use(contentPromise);
}

/** Convenience: look up a single project by slug, or null. */
export function useProject(slug) {
  const { projects } = use(contentPromise);
  return projects.find((p) => p.slug === slug) ?? null;
}
