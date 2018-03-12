/**
 * A function which takes an object and iterates over each of its
 * properties using a provided iteration handler function.
 *
 * @internal
 */
type ObjectPropertyIterator<T = any> = (
  object: any,
  iterationHandler: ObjectPropertyIterationHandler<T>
) => void;

/**
 * A callback function which handles object property iterations for an
 * ObjectPropertyIterator function.
 *
 * @internal
 */
type ObjectPropertyIterationHandler<T = any> = (
  property: T,
  propertyKey: string,
  object: any
) => void;

/**
 * A function which receives a value and returns a boolean based
 * on arbitrary criteria.
 *
 * @internal
 */
type FilterFunction<T> = (
  value: T
) => boolean;

/**
 * @internal
 */
function createFilteredObjectPropertyIterator <T>(
  filterFunction: FilterFunction<T>
): ObjectPropertyIterator<T> {
  return (object: any, iterationHandler: ObjectPropertyIterationHandler<T>) => {
    Object.keys(object)
      .forEach(propertyKey => {
        const property = object[propertyKey];

        if (filterFunction(property)) {
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
