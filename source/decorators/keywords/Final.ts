import { createDecorator } from '../../internals/decorator-utils';
import { DecoratorFactory, DecoratorTarget } from '../../types/decorator-types';
import { IConstructable, Method } from '../../types/standard-types';

/**
 * Takes a property descriptor and returns it in a non-writable,
 * non-configurable format.
 *
 * @internal
 */
const createFinalPropertyDescriptor = (
  { value }: PropertyDescriptor
): PropertyDescriptor => ({
  value,
  writable: false,
  configurable: false
});

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
        const { name: derivedCtorName } = this.constructor;
        const { name: finalCtorName } = target.constructor;

        throw new Error(`Cannot instantiate ${derivedCtorName}: invalid extension of ${finalCtorName}!`);
      }
    }
  }

  Object.freeze(FinalClass);
  Object.freeze(FinalClass.prototype);

  return FinalClass;
}

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
