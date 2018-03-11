import { Callback } from '../Types/standard-types';
import { Decorator, DecoratorTarget } from '../Types/decorator-types';

/**
 * Normalizes a decorator target parameter to its constructor function.
 *
 * @internal
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
 * @internal
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
