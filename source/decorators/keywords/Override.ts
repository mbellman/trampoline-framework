import { createNormalizedDecorator } from '../../internals/decorator-utils';
import { DecoratorTarget } from '../../types/decorator-types';
import { getClassTaxonomy } from '../../internals/reflection-utils';

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
    const { prototype, name, parentName } = getClassTaxonomy(target);

    if (!prototype[propertyKey]) {
      throw new Error(`Invalid @Override on class '${name}' method '${propertyKey}': superclass '${parentName}' does not implement '${propertyKey}'!`);
    }
  }
});
