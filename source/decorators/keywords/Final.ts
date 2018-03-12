import { createDecorator } from '../../internals/decorator-utils';
import { DecoratorFactory, DecoratorTarget } from '../../types/decorator-types';
import { IConstructable, Method } from '../../types/standard-types';

/**
 * Takes a property descriptor and returns it in a non-writable,
 * non-configurable format.
 *
 * @internal
 */
function createFinalPropertyDescriptor (
  { value }: PropertyDescriptor
): PropertyDescriptor {
  return {
    value,
    writable: false,
    configurable: false
  };
}

/**
 * Returns a non-extensible class from a target constructable.
 *
 * @internal
 */
function createFinalClass (
  target: IConstructable
): IConstructable {
  class FinalClass extends (target as IConstructable) {
    public constructor (...args: any[]) {
      super(...args);

      if (this.constructor !== FinalClass) {
        // If a final class is extended in a non-strict module,
        // no Error will be thrown at runtime. To drive the point
        // home we'll throw an Error whenever the final class
        // is instantiated using a constructor other than its
        // own (likely indicating a super() call from a derived
        // class constructor).
        const { name: derivedClassName } = this.constructor;
        const { name: finalClassName } = target.constructor;

        throw new Error(`Cannot instantiate ${derivedClassName}: invalid extension of ${finalClassName}!`);
      }
    }
  }

  Object.freeze(FinalClass);
  Object.freeze(FinalClass.prototype);

  return FinalClass;
}

/**
 * A class and method decorator which prevents extension and overriding,
 * respectively.
 *
 * @example 1:
 * ```
 * @Final class A {
 * }
 *
 * // Throws Error in strict mode
 * class B extends A { }
 *
 * // Throws Error in non-strict mode
 * const b: B = new B();
 * ```
 *
 * @example 2:
 * ```
 * class A {
 *   @Final public method (): void { }
 * }
 *
 * class B extends A {
 *   // Throws Error
 *   public method (): void { }
 * }
 * ```
 */
export const Final = createDecorator<ClassDecorator & MethodDecorator>(
  (target: DecoratorTarget, propertyKey?: string | symbol, propertyDescriptor?: PropertyDescriptor) => {
    if (propertyKey && propertyDescriptor) {
      // Method decorator
      return createFinalPropertyDescriptor(propertyDescriptor);
    } else {
      // Class decorator
      return createFinalClass(target as IConstructable);
    }
  }
);
