export function toArray <T>(iterable: Iterable<T>): T[] {
  return Array.prototype.slice.call(iterable, 0);
}
