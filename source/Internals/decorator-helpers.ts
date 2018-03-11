import { Decorator, DecoratorTarget } from '../Types/decorator-types';
import { Callback } from '../Types/standard-types';

/**
 * Normalizes a decorator target parameter to its constructor function.
 *
 * @param {Function} target
 * @returns {Function}
 */
export function normalizeTargetToConstructor (
  target: Function
): Function {
  const { prototype } = target;

  return prototype ? prototype.constructor : target.constructor;
}

/**
 * Returns a wrapped decorator function which forwards a normalized
 * target value to the original provided decorator. An optional normalizer
 * can be provided instead of the default, which normalizes the target
 * to its original constructor function.
 *
 * @param {Decorator} decorator - The decorator function to normalize
 * @param {?Callback<Function>} normalizer - The function used to normalize the decorator target parameter
 * @returns {Decorator}
 */
export function createNormalizedDecorator (
  decorator: Decorator,
  normalizer: Callback<Function> = normalizeTargetToConstructor,
): Decorator {
  return (target: DecoratorTarget, ...args: any[]) => {
    const normalizedTarget = normalizer(target as Function);

    return decorator.call(null, normalizedTarget, ...args);
  };
}
