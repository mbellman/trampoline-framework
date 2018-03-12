import { Callback } from '../Types/standard-types';
import { Decorator, DecoratorTarget } from '../Types/decorator-types';

/**
 * Returns a decorator function typecast to the provided D generic
 * type parameter, which defaults to Decorator.
 *
 * @todo
 * It may be useful to have this function generate or take metadata
 * for the decorator in addition to the typecast.
 *
 * @internal
 */
export const createDecorator = <D extends Decorator = Decorator>(
  decorator: Decorator
): D => decorator as D;

/**
 * Returns a wrapped decorator function which forwards a normalized
 * target value to the original decorator. An optional normalizer
 * can be provided instead of the default, which normalizes the target
 * to its original constructor function.
 *
 * @internal
 */
export const createNormalizedDecorator = <D extends Decorator = Decorator>(
  decorator: Decorator,
  normalizer: Callback<Function> = normalizeTargetToConstructor,
): D => createDecorator<D>(
  (target: DecoratorTarget, ...args: any[]) => {
    const normalizedTarget = normalizer(target as Function);

    return decorator.call(null, normalizedTarget, ...args);
  }
);

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
