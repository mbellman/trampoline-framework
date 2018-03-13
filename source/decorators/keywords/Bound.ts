import { createDecorator } from '../../internals/decorator-utils';
import { DecoratorTarget } from '../../types/decorator-types';
import { forMethodsOnObject } from '../../internals/object-utils';

/**
 * Returns a property descriptor for a class prototype method which
 * allows the method to be bound to instance contexts.
 *
 * @internal
 */
function createBoundMethodPropertyDescriptor (
  method: Function,
  methodName: string
): PropertyDescriptor {
  return {
    get () {
      const boundMethod = method.bind(this);

      Object.defineProperty(this, methodName, {
        get () {
          return boundMethod;
        }
      });

      return boundMethod;
    }
  };
}

/**
 * A class and class method decorator decorator which binds methods
 * to instance contexts. When applied to a class, all methods are
 * context-bound.
 *
 * @example 1:
 * ```
 * @Bound class A {
 *   method1 () { }
 *   method2 () { }
 *   method3 () { }
 * }
 * ```
 *
 * @example 2:
 * ```
 * class A {
 *   public prop: any;
 *
 *   @Bound public boundMethod (prop: any): void {
 *     this.prop = prop;
 *   }
 * }
 * ```
 */
export const Bound = createDecorator<ClassDecorator & MethodDecorator>({
  name: 'Bound',
  class: ({ prototype }: Function) => {
    forMethodsOnObject(prototype, (method, methodName) => {
      const propertyDescriptor = createBoundMethodPropertyDescriptor(method, methodName);

      Object.defineProperty(prototype, methodName, propertyDescriptor);
    });
  },
  method: (target: Object, propertyKey: string | symbol, { value }: PropertyDescriptor) => {
    return createBoundMethodPropertyDescriptor(value, propertyKey as string);
  }
});
