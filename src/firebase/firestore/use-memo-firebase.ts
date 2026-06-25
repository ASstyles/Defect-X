'use client';

import { useMemo, useRef } from 'react';

/**
 * A hook to memoize a Firebase reference or query.
 * It uses a ref to store the previous dependencies and only re-creates the
 * reference/query if the dependencies have changed.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  const ref = useRef<T | null>(null);
  const prevDeps = useRef<any[]>([]);

  const depsChanged =
    deps.length !== prevDeps.current.length ||
    deps.some((dep, i) => dep !== prevDeps.current[i]);

  if (depsChanged || ref.current === null) {
    ref.current = factory();
    prevDeps.current = deps;
  }

  return ref.current;
}
