import { Callback, IConstructable, Method } from '../types/standard-types';
import { Decorator, DecoratorTarget, NormalizedClassDecorator, NormalizedMethodDecorator, NormalizedParameterDecorator, NormalizedPropertyDecorator } from '../types/decorator-types';
import { hasValue } from './type-utils';

/**
 * A recreation of the __decorate() function which TypeScript generates
 * at compilation. Having this available at design-time allows multiple
 * decorators to be chained together, providing an easy composition
 * solution for composeDecorators().
 *
 * @internal
 */
function decorate (
  decorators: Function[],
  target: DecoratorTarget,
  key?: string,
  arg3?: PropertyDescriptor | number
): any {
  const totalArguments = arguments.length;
  const isDecoratingClass = totalArguments < 3;
  const isDecoratingMethodOrParameter = totalArguments > 3;

  let accumulatedResult = (
    isDecoratingClass
      ? target :
    arg3 === null
      ? (arg3 = Object.getOwnPropertyDescriptor(target, key as string)) :
    arg3
  );

  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") {
    accumulatedResult = Reflect.decorate.call(Reflect, decorators, target, key, arg3);
  } else {
    accumulatedResult =
      decorators.reverse()
        .reduce((acc, decorator) => {
          const result = (
            isDecoratingClass
              ? decorator(accumulatedResult) :
            isDecoratingMethodOrParameter
              ? decorator(target, key, accumulatedResult) :
            decorator(target, key)
          );

          return result || acc;
        });
  }

  if (isDecoratingMethodOrParameter && accumulatedResult) {
    return Object.defineProperty(target, key as string, accumulatedResult);
  }

  return accumulatedResult;
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
      return resolvedDecorator.call(null, target, propertyKey, propertyDescriptorOrParameterIndex);
    } else {
      throw new Error(`Invalid binding by decorator @${name}! Received arguments: [ ${target}, ${propertyKey}, ${propertyDescriptorOrParameterIndex} ]`);
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
 * Returns a wrapped decorator function which passes a normalized target
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

    return decorator.call(null, normalizedTarget, ...args);
  };

  return normalizedDecorator as D;
}

/**
 * @internal
 */
export function composeDecorators <D extends Decorator>(
  ...decorators: D[]
): D {
  const composedDecorator = (...args: any[]) => {
    return decorate.call(null, decorators, ...args);
  };

  return composedDecorator as D;
}
