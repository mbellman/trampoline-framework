import { Callback } from '../types/standard-types';
import { composeDecorators, createDecorator } from '../internals/decorator-utils';

/**
 * @internal
 */
type EventProcessor = Callback<Event>;

/**
 * Creates a decorator for event handler class methods which cause
 * events passed to the method to be handled using a custom event
 * processor function beforehand.
 *
 * @internal
 */
function createEventHandlerDecorator (
  name: string,
  eventProcessor: EventProcessor
): MethodDecorator {
  return createDecorator<MethodDecorator>({
    name,
    methodDecorator: (target: Object, propertyKey: string | symbol, { value }: PropertyDescriptor) => {
      return {
        value: function (e: Event, ...args: any[]) {
          eventProcessor(e);

          return value.call(this, e, ...args);
        }
      };
    }
  });
}

/**
 * Prevents default event behavior for events passed into decorated
 * class method event handlers.
 *
 * ```
 * class View {
 *   @PreventDefault
 *   public onClick (e: Event): void { }
 * }
 * ```
 */
export const PreventDefault = createEventHandlerDecorator('PreventDefault', (e: Event) => {
  e.preventDefault();
});

/**
 * Stops event propagation from decorated class method event handlers.
 *
 * ```
 * class View {
 *   @StopPropagation
 *   public onClick (e: Event): void { }
 * }
 * ```
 */
export const StopPropagation = createEventHandlerDecorator('StopPropagation', (e: Event) => {
  e.stopPropagation();
});

/**
 * Composes @StopPropagation and @PreventDefault into a single decorator.
 *
 * ```
 * class View {
 *   @SuppressEvent
 *   public onClick (e: Event): void { }
 * }
 * ```
 */
export const SuppressEvent = composeDecorators<MethodDecorator>(PreventDefault, StopPropagation);
