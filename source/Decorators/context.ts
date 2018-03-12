import { DecoratorTarget } from '../Types/decorator-types';
import { forMethodsOnObject } from '../Internals/object-utils';

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
 * A class method decorator which binds decorated methods to instance contexts.
 *
 * ```
 * class A {
 *   public prop: any;
 *
 *   @Bind
 *   public boundMethod (prop: any): void {
 *     this.prop = prop;
 *   }
 * }
 * ```
 */
export const Bind: MethodDecorator = (
  target: DecoratorTarget,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): PropertyDescriptor => createBoundMethodPropertyDescriptor(descriptor.value, propertyKey as string);

/**
 * A class decorator which binds all class methods to instance contexts.
 *
 * ```
 * @BindAll
 * class A {
 *   method1 () { }
 *   method2 () { }
 *   method3 () { }
 * }
 * ```
 */
export const BindAll: ClassDecorator = (
  target: Function,
): void => {
  const { prototype } = target;

  forMethodsOnObject(prototype, (method, methodName) => {
    const propertyDescriptor = createBoundMethodPropertyDescriptor(method, methodName);

    Object.defineProperty(prototype, methodName, propertyDescriptor);
  });
};
