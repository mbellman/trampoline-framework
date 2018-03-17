import { Callback } from '../types/standard-types';

/**
 * Converts an iterable value to an Array.
 *
 * @internal
 */
export function toArray <T>(
  iterable: Iterable<T>
): T[] {
  return Array.prototype.slice.call(iterable, 0);
}

/**
 * Takes T[] and returns a 2-tuple of T[] where the first set
 * contains all values for which {predicate} returns true, and
 * the second contains all values for the inverse.
 *
 * @internal
 */
export function partition <T>(
  iterable: T[],
  predicate: (value: T, index: number, iterable: T[]) => boolean
): [ T[], T[] ] {
  return [
    iterable.filter(predicate),
    iterable.filter((value, index, array) => !predicate(value, index, array))
  ];
}
