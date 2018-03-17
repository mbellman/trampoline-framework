import { createDecorator } from '../../internals/decorator-utils';
import { DecoratorTarget } from '../../types/decorator-types';
import { forMethodsOnObject } from '../../internals/object-utils';
import { IConstructable } from '../../types/standard-types';

/**
 * Warns with an optional developer-provided message passed along from an
 * @Unfinished() decorator, and throws with a required internal error message.
 *
 * @internal
 */
function throwUnfinishedError (
  errorMessage: string,
  developerMessage?: string,
): void {
  if (developerMessage) {
    console.warn(developerMessage);
  }

  throw new Error(errorMessage);
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
  developerMessage?: string
): PropertyDescriptor {
  return {
    value: () => {
      throwUnfinishedError(
        `Invalid call to unfinished class '${className}' method '${methodName}'!`,
        developerMessage
      );
    }
  };
}

/**
 * Stubs decorated methods, or all instance and static methods on decorated
 * classes, with an optional warning message and a thrown Error.
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
  developerMessage?: string
): ClassDecorator & MethodDecorator {
  return createDecorator<ClassDecorator & MethodDecorator>({
    name: 'Unfinished',
    classDecorator: (target: Function) => {
      // Only stub static methods; class construction will throw
      // an Error and prevent actual instance creation
      forMethodsOnObject(target, (method: Function, methodName: string, object: DecoratorTarget) => {
        const unfinishedMethod = createUnfinishedMethodPropertyDescriptor(target.name, methodName, developerMessage);

        Object.defineProperty(object, methodName, unfinishedMethod);
      });

      return class extends (target as IConstructable) {
        public constructor () {
          super();

          throwUnfinishedError(
            `Invalid construction of unfinished class '${target.name}!'`,
            developerMessage
          );
        }
      };
    },
    methodDecorator: (target: DecoratorTarget, propertyKey: string | symbol) => {
      const className = target.constructor.name;
      const methodName = propertyKey as string;

      return createUnfinishedMethodPropertyDescriptor(className, methodName, developerMessage);
    }
  });
}
