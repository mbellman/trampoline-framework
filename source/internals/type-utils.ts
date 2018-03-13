/**
 * @internal
 */
export function hasValue(
  value: any
): boolean {
  return value !== null && typeof value !== 'undefined';
}
