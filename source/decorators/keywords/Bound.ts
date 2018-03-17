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
 * A class and class method decorator decorator which binds instance
 * methods to instance contexts. When applied to a class, all methods
 * are context-bound.
 *
 * @example 1:
 * ```
 * @Bound class View {
 *   public onButtonClick (): void { }
 *   public onOptionClick (): void { }
 *   public onLinkClick (): void { }
 * }
 * ```
 *
 * @example 2:
 * ```
 * class A {
 *   public prop: any;
 *
 *   @Bound public assignProp (prop: any): void {
 *     this.prop = prop;
 *   }
 * }
 * ```
 */
export const Bound = createDecorator<ClassDecorator & MethodDecorator>({
  name: 'Bound',
  classDecorator: ({ prototype }: Function) => {
    forMethodsOnObject(prototype, (method, methodName) => {
      const propertyDescriptor = createBoundMethodPropertyDescriptor(method, methodName);

      Object.defineProperty(prototype, methodName, propertyDescriptor);
    });
  },
  methodDecorator: (target: DecoratorTarget, propertyKey: string | symbol, { value }: PropertyDescriptor) => {
    if (target.prototype) {
      throw new Error(`@Bound decoration of static methods not allowed! [ '${target.name}'.'${propertyKey}'() ]`);
    }

    return createBoundMethodPropertyDescriptor(value, propertyKey as string);
  }
});
