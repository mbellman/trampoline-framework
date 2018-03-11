import { DecoratorTarget } from '../Types/decorator-types';

/**
 * Returns a property descriptor for a class prototype method which
 * facilitates instance context binding.
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
 * A class method decorator which binds the method context to instances
 * of the class.
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
 * A class decorator which binds all class methods to instances
 * of the class.
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

  Object.keys(prototype)
    .forEach(propertyKey => {
      const property = prototype[propertyKey];
      const propertyDescriptor = createBoundMethodPropertyDescriptor(property, propertyKey);

      Object.defineProperty(prototype, propertyKey, propertyDescriptor);
    });
};
