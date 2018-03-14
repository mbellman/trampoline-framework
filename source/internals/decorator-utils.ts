import { Callback, IConstructable, Method } from '../types/standard-types';
import { Decorator, DecoratorTarget, NormalizedClassDecorator, NormalizedMethodDecorator, NormalizedParameterDecorator, NormalizedPropertyDecorator } from '../types/decorator-types';
import { hasValue } from './type-utils';

/**
 * Calls {decorator} with provided arguments in a non-typesafe fashion.
 * Necessary to allow dynamic decorator calls with dynamic parameters,
 * only by module internals, to circumvent type incompatibilities.
 *
 * @internal
 */
function callDecorator (
  decorator: Function,
  ...args: any[]
): void {
  return decorator.apply(null, args);
}
/**
 * Normalizes a decorator {target} parameter to its constructor function.
 *
 * @internal
 */
function normalizeTargetToConstructor (
  target: any
): Function {
  const { prototype } = target;

  return prototype ? prototype.constructor : target.constructor;
}

/**
 * @internal
 */
function createConfiguredDecorator (
  {
    name,
    classDecorator,
    methodDecorator,
    propertyDecorator,
    parameterDecorator
  }: IDecoratorConfiguration
): Decorator {
  return (target: DecoratorTarget, propertyKey?: string | symbol, propertyDescriptorOrParameterIndex?: PropertyDescriptor | number) => {
    const resolvedDecorator = (
      !hasValue(propertyKey) && !hasValue(propertyDescriptorOrParameterIndex)
        ? classDecorator :
      hasValue(propertyDescriptorOrParameterIndex) && typeof propertyDescriptorOrParameterIndex !== 'number'
        ? methodDecorator :
      !hasValue(propertyDescriptorOrParameterIndex)
        ? propertyDecorator :
      typeof propertyDescriptorOrParameterIndex === 'number'
        ? parameterDecorator :
      null
    );

    if (resolvedDecorator) {
      return callDecorator(resolvedDecorator, target, propertyKey, propertyDescriptorOrParameterIndex);
    } else {
      throw new Error(`Invalid binding by decorator @${name}! Arguments: [ ${target}, ${propertyKey}, ${propertyDescriptorOrParameterIndex} ]`);
    }
  };
}

/**
 * Represents a configuration object to provide to createDecorator() or
 * createNormalizedDecorator().
 *
 * @internal
 */
export interface IDecoratorConfiguration {
  name: string;
  classDecorator?: ClassDecorator | NormalizedClassDecorator;
  methodDecorator?: MethodDecorator | NormalizedMethodDecorator;
  propertyDecorator?: PropertyDecorator | NormalizedPropertyDecorator;
  parameterDecorator?: ParameterDecorator | NormalizedParameterDecorator;
}

/**
 * Returns a decorator function typecast to the provided generic
 * type parameter, which defaults to Decorator.
 *
 * @todo
 * It may be useful to have this function generate or take metadata
 * for the decorator in addition to the typecast.
 *
 * @internal
 */
export function createDecorator <D extends Decorator = Decorator>(
  decoratorConfiguration: IDecoratorConfiguration
): D {
  return createConfiguredDecorator(decoratorConfiguration) as D;
}

/**
 * Returns a wrapped decorator function which forwards a normalized target
 * value to the provided decorator functions on a {decoratorConfiguration}.
 * An optional normalizer function can be provided instead of the default,
 * which normalizes the target to its original constructor function.
 *
 * @internal
 */
export function createNormalizedDecorator <D extends Decorator = Decorator>(
  decoratorConfiguration: IDecoratorConfiguration,
  normalizer: Callback<any, DecoratorTarget> = normalizeTargetToConstructor,
): D {
  const decorator = createDecorator<D>(decoratorConfiguration);

  const normalizedDecorator = (target: DecoratorTarget, ...args: any[]) => {
    const normalizedTarget = normalizer(target as Function);

    return callDecorator(decorator, normalizedTarget, ...args);
  };

  return normalizedDecorator as D;
}
