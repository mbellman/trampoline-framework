import { PreventDefault, StopPropagation, SuppressEvent } from '../../source';
import { expect } from 'chai';
import 'mocha';

/**
 * A polyfilled subset of the base DOM Event class
 * available on the client-side.
 */
class Event {
  public bubbles: boolean = true;
  public defaultPrevented: boolean = false;

  public constructor (type: string) { }

  public preventDefault (): void {
    this.defaultPrevented = true;
  }

  public stopPropagation (): void {
    this.bubbles = false;
  }
}

describe('Event Handler Decorators', () => {
  describe('@PreventDefault', () => {
    it('should prevent default event behavior', () => {
      class A {
        @PreventDefault
        public onEvent (e: Event): void { }
      }

      const a = new A();
      const event = new Event('click');

      a.onEvent(event);

      expect(event.defaultPrevented).to.be.true;
    });
  });

  describe('@StopPropagation', () => {
    it('should stop event propagation', () => {
      class A {
        @StopPropagation
        public onEvent (e: Event): void { }
      }

      const a = new A();
      const event = new Event('click');

      a.onEvent(event);

      expect(event.bubbles).to.be.false;
    });
  });

  describe('@SuppressEvent', () => {
    it('should prevent default event behavior and stop event propagation', () => {
      class A {
        @SuppressEvent
        public onEvent (e: Event): void { }
      }

      const a = new A();
      const event = new Event('click');

      a.onEvent(event);

      expect(event.defaultPrevented).to.be.true;
      expect(event.bubbles).to.be.false;
    });
  });
});
