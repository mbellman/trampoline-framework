/**
 * A signature for functions which takes an object and iterate
 * over each of its properties using a provided iteration
 * handler function.
 *
 * @internal
 */
type ObjectPropertyIterator<T = any> = (
  object: any,
  iterationHandler: ObjectPropertyIterationHandler<T>
) => void;

/**
 * A signature for callback functions which handle each iterated
 * property for an ObjectPropertyIterator function.
 *
 * @internal
 */
type ObjectPropertyIterationHandler<T = any> = (
  property: T,
  propertyKey: string,
  object: any
) => void;

/**
 * A signature for filter predicate functions.
 *
 * @internal
 */
type FilterPredicate<T> = (
  value: T
) => boolean;

/**
 * @internal
 */
function createFilteredObjectPropertyIterator <T>(
  filterPredicate: FilterPredicate<T>
): ObjectPropertyIterator<T> {
  return (object: any, iterationHandler: ObjectPropertyIterationHandler<T>) => {
    Object.keys(object)
      .forEach(propertyKey => {
        const property = object[propertyKey];

        if (filterPredicate(property)) {
          iterationHandler(property, propertyKey, object);
        }
      });
  };
}

/**
 * Clones a provided object or value.
 *
 * @internal
 */
export function clone <T>(
  object: T
): T {
  return JSON.parse(JSON.stringify(object));
}

/**
 * Iterates over all functions on a provided object.
 *
 * @internal
 */
export const forMethodsOnObject = createFilteredObjectPropertyIterator<Function>(
  (value: any) => typeof value === 'function'
);
