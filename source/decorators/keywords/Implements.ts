import { createNormalizedDecorator } from '../../internals/decorator-utils';
import { DecoratorTarget } from '../../types/decorator-types';
import { getClassTaxonomy } from '../../internals/reflection-utils';

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
    const { prototype, name, parentName } = getClassTaxonomy(target);

    if (prototype[propertyKey] || prototype.prototype[propertyKey]) {
      throw new Error(`Invalid @Implements on class '${name}' method '${propertyKey}': superclass '${parentName}' already implements '${propertyKey!}'`);
    }
  }
});
