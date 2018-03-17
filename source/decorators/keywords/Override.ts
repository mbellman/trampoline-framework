import { createNormalizedDecorator } from '../../internals/decorator-utils';
import { DecoratorTarget } from '../../types/decorator-types';
import { hasInheritedInstanceMember, hasInheritedStaticMember, isInstanceMethod, isStaticMethod } from '../../internals/reflection-utils';

/**
 * A method decorator which merely labels a method as an override
 * for a superclass method. If the superclass lacks the corresponding
 * method, an Error is thrown.
 *
 * ```
 * class AppView extends View {
 *   @Override public onRender (): {
 *     // ...
 *   }
 * }
 * ```
 */
export const Override = createNormalizedDecorator<MethodDecorator>({
  name: 'Override',
  methodDecorator: (target: DecoratorTarget, propertyKey: string | symbol) => {
    const isInvalidInstanceOverride = isInstanceMethod(target, propertyKey) && !hasInheritedInstanceMember(target, propertyKey);
    const isInvalidStaticOverride = isStaticMethod(target, propertyKey) && !hasInheritedStaticMember(target, propertyKey);

    if (isInvalidInstanceOverride || isInvalidStaticOverride) {
      const methodType = isInvalidInstanceOverride ? 'instance' : 'static';

      throw new Error(`Invalid @Override on class '${target.name}' ${methodType} method '${propertyKey}': no superclasses have '${propertyKey}'!`);
    }
  }
});
