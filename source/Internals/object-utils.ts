/**
 * A function which takes an object and iterates over each of its
 * properties using a provided iteration handler function.
 *
 * @internal
 */
type ObjectIterator<T = any> = (
  object: any,
  iterationHandler: ObjectIterationHandler<T>
) => void;

/**
 * A callback function which handles object property iterations for an
 * ObjectIterator function.
 *
 * @internal
 */
type ObjectIterationHandler<T = any> = (
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
function createFilteredObjectIterator <T>(
  filterFunction: FilterFunction<T>
): ObjectIterator<T> {
  return (object: any, iterationHandler: ObjectIterationHandler<T>) => {
    Object.keys(object)
      .forEach(propertyKey => {
        if (filterFunction(object[propertyKey])) {
          iterationHandler(object[propertyKey], propertyKey, object);
        }
      });
  };
}

/**
 * Clones a provided object or value.
 *
 * @internal
 */
export function clone <T>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}

/**
 * Iterates over all functions on a provided object.
 *
 * @internal
 */
export const forObjectMethods = createFilteredObjectIterator<Function>(
  (value: any) => typeof value === 'function'
);
