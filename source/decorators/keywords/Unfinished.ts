import { createDecorator } from '../../internals/decorator-utils';
import { DecoratorTarget } from '../../types/decorator-types';
import { forMethodsOnObject } from '../../internals/object-utils';
import { IConstructable } from '../../types/standard-types';

/**
 * Warns with {message} if one is provided.
 *
 * @internal
 */
function warn (
  message?: string
): void {
  if (message) {
    console.warn(message);
  }
}

/**
 * Returns a property descriptor for an @Unfinished class method which
 * causes calls to the method to log warnings, and the return value of
 * the method to be null.
 *
 * @internal
 */
function createUnfinishedMethodPropertyDescriptor (
  className: string,
  methodName: string,
  message?: string
): PropertyDescriptor {
  return {
    value: () => {
      warn(`Invalid call to unfinished class '${className}' method '${methodName}'!`);
      warn(message);

      return null;
    }
  };
}

/**
 * Stubs decorated methods, or all instance and static methods on decorated
 * classes, with an optional warning message and a null return value.
 *
 * @example 1:
 * ```
 * class A {
 *   @Unfinished('Not done yet.')
 *   public getValue (): void { }
 * }
 * ```
 *
 * @example 2:
 * ```
 * @Unfinished('Still needs work.')
 * class A {
 *   public field: string;
 *
 *   public getField (): void { }
 * }
 * ```
 */
export function Unfinished (
  message?: string
): ClassDecorator & MethodDecorator {
  return createDecorator<ClassDecorator & MethodDecorator>({
    name: 'Unfinished',
    classDecorator: (target: Function) => {
      const stubUnfinishedMethod = (method: Function, methodName: string, object: DecoratorTarget) => {
        const unfinishedMethod = createUnfinishedMethodPropertyDescriptor(target.name, methodName, message);

        Object.defineProperty(object, methodName, unfinishedMethod);
      };

      forMethodsOnObject(target, stubUnfinishedMethod);
      forMethodsOnObject(target.prototype, stubUnfinishedMethod);

      return class extends (target as IConstructable) {
        public constructor () {
          super();

          warn(`Invalid construction of unfinished class ${target.name}!`);
          warn(message);
        }
      };
    },
    methodDecorator: (target: DecoratorTarget, propertyKey: string | symbol) => {
      const className = target.constructor.name;
      const methodName = propertyKey as string;

      return createUnfinishedMethodPropertyDescriptor(className, methodName, message);
    }
  });
}
