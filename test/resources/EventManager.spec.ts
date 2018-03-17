import { expect } from 'chai';
import { EventManager } from '../../source';
import 'mocha';

describe('EventManager', () => {
  describe('on()', () => {
    it('should bind event handlers to be fired when trigger() is called for their events', () => {
      function handler () {
        expect(true).to.be.true;
      }

      const eventManager = new EventManager();

      eventManager.on('event', handler);
      eventManager.trigger('event');
    });
  });

  describe('trigger()', () => {
    it('should call only event handlers for the triggered event', () => {
      let total = 0;

      function addOne () {
        total++;
      }

      function addTwo () {
        total += 2;
      }

      function subtractOne () {
        total--;
      }

      const eventManager = new EventManager();

      eventManager.on('add', addOne);
      eventManager.on('add', addTwo);
      eventManager.on('subtract', subtractOne);
      eventManager.trigger('add');

      expect(total).to.equal(3);
    });

    it('should pass arguments to event handlers', () => {
      const personName = 'Jim';
      const personAge = 25;

      function personEventHandler (name: string, age: number) {
        expect(name).to.equal(personName);
        expect(age).to.equal(personAge);
      }

      const eventManager = new EventManager();

      eventManager.on('person', personEventHandler);
      eventManager.trigger('person', personName, personAge);
    });
  });

  describe('off()', () => {
    it('should remove a specified event handler for an event', () => {
      function goodEventHandler () {
        expect(true).to.be.true;
      }

      function badEventHandler () {
        expect(true).to.be.false;
      }

      const eventManager = new EventManager();

      eventManager.on('event', goodEventHandler);
      eventManager.on('event', badEventHandler);
      eventManager.off('event', badEventHandler);
      eventManager.trigger('event');
    });

    it('should remove all event handlers for an event when no handler is specified', () => {
      let total = 0;

      function addOne () {
        total++;
      }

      function addTwo () {
        total += 2;
      }

      const eventManager = new EventManager();

      eventManager.on('event', addOne);
      eventManager.on('event', addTwo);
      eventManager.off('event');
      eventManager.trigger('event');

      expect(total).to.equal(0);
    });

    it('should remove all event handlers when called with no arguments', () => {
      function badEventHandler () {
        expect(true).to.be.false;
      }

      function badEventHandler2 () {
        expect(5).to.equal(10);
      }

      function badEventHandler3 () {
        expect(typeof 'hello' === 'number').to.be.true;
      }

      const eventManager = new EventManager();

      eventManager.on('event', badEventHandler);
      eventManager.on('event', badEventHandler2);
      eventManager.on('event', badEventHandler3);

      eventManager.off();
      eventManager.trigger('event');

      // If we made it this far, all the bad assertions were avoided!
      expect(true).to.be.true;
    });
  });
});
