import { createNormalizedDecorator } from '../../internals/decorator-utils';
import { DecoratorTarget } from '../../types/decorator-types';
import { hasInheritedInstanceMember, hasInheritedStaticMember, isInstanceMethod, isStaticMethod } from '../../internals/reflection-utils';

/**
 * A method decorator which merely labels a method as an implementation
 * for an interface or abstract class method. If a superclass already
 * implements the decorated method, an Error is thrown.
 *
 * ```
 * class Service implements IFetchable {
 *   @Implements public fetch (): Promise<any> {
 *     // ...
 *   }
 * }
 * ```
 */
export const Implements = createNormalizedDecorator<MethodDecorator>({
  name: 'Implements',
  methodDecorator: (target: DecoratorTarget, propertyKey: string | symbol) => {
    const isInvalidInstanceImplementation = isInstanceMethod(target, propertyKey) && hasInheritedInstanceMember(target, propertyKey);
    const isInvalidStaticImplementation = isStaticMethod(target, propertyKey) && hasInheritedStaticMember(target, propertyKey);

    if (isInvalidInstanceImplementation || isInvalidStaticImplementation) {
      throw new Error(`Class '${target.name}' cannot @Implement method '${propertyKey}': a superclass already implements '${propertyKey}'!`);
    }
  }
});
