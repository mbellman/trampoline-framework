import { expect } from 'chai';
import { Map, MapIterable, MapEntry } from '../../source';
import 'mocha';

describe('Map', () => {
  describe('Constructor', () => {
    it('should return a Map instance', () => {
      const map: Map = new Map();

      expect(map).to.be.an.instanceof(Map);
    });

    it('should take a MapIterable as a parameter', () => {
      const iterable: MapIterable<number, string> = [
        [ 1, 'hello' ],
        [ 2, 'goodbye' ]
      ];

      const map: Map<number, string> = new Map(iterable);

      expect(map.get(1)).to.equal('hello');
      expect(map.get(2)).to.equal('goodbye');
    });
  });

  describe('size', () => {
    it('should return the number of Map entries', () => {
      const map: Map = new Map();

      map.set(1, 'hello');
      map.set(2, 'goodbye');

      expect(map.size).to.equal(2);
    });
  });

  describe('clear()', () => {
    it('should remove all entries from the Map', () => {
      const map: Map = new Map();

      map.set(1, 'hello');
      map.set(2, 'goodbye');

      map.clear();

      expect(map.size).to.equal(0);
      expect(map.get(1)).to.be.undefined;
      expect(map.get(2)).to.be.undefined;
    });
  });

  describe('delete(key)', () => {
    it('should remove a key/value pair from the Map', () => {
      const map: Map = new Map();

      map.set('yes', 'no');
      map.set('stop', 'go');
      map.set('why', "I don't know");
      map.set('goodbye', 'hello');

      map.delete('stop');

      expect(map.size).to.equal(3);
      expect(map.get('stop')).to.be.undefined;
    });

    it('should do nothing for a nonexistent key/value pair', () => {
      const map: Map = new Map();

      map.delete(1);

      expect(map.size).to.equal(0);
      expect(map.get(1)).to.be.undefined;
    });
  });

  describe('entries()', () => {
    it('should return a new MapIterable from the contents of the Map', () => {
      const iterable: MapIterable<number, string> = [
        [ 1, 'hello' ],
        [ 2, 'goodbye' ]
      ];

      const map: Map<number, string> = new Map(iterable);
      const clonedIterable: MapIterable<number, string> = map.entries();

      expect(iterable).to.not.equal(clonedIterable);
      expect(iterable).to.deep.equal(clonedIterable);
    });
  });

  describe('forEach(handler)', () => {
    it('should iterate over each key/value pair in the Map and call the handler with the appropriate arguments', () => {
      const map: Map<number, string> = new Map();
      let i: number = 0;

      map.set(1, 'hello');
      map.set(2, 'goodbye');
      map.set(3, 'okay');

      map.forEach((value: string, key: number, mapReference: Map<number, string>) => {
        const mapEntry: MapEntry<number, string> = map.entries()[i];

        expect(value).to.equal(mapEntry[1]);
        expect(key).to.equal(mapEntry[0]);
        expect(mapReference).to.equal(map);

        i++;
      });
    });
  });

  describe('get(key)', () => {
    it('should return the value for {key}', () => {
      const map: Map = new Map();

      map.set(1, 'hello');
      map.set(2, 'goodbye');

      expect(map.get(1)).to.equal('hello');
      expect(map.get(2)).to.equal('goodbye');
    });
  });

  describe('has(key)', () => {
    it('should return a boolean determining whether a key/value pair exists for {key}', () => {
      const map: Map = new Map();

      map.set(1, 'hello');
      map.set(2, 'goodbye');

      expect(map.has(1)).to.be.true;
      expect(map.has(2)).to.be.true;
      expect(map.has(3)).to.be.false;
    });
  });

  describe('keys()', () => {
    it('should return an array of keys in the Map', () => {
      const map: Map = new Map();

      map.set(1, 'hello');
      map.set(2, 'goodbye');
      map.set(3, 'okay');

      expect(map.keys()).to.deep.equal([ 1, 2, 3 ]);
    });
  });

  describe('set(key, value)', () => {
    it('should add a new key/value pair where one does not exist', () => {
      const map: Map = new Map();

      map.set(1, 'hello');

      expect(map.get(1)).to.equal('hello');
    });

    it('should overwrite a key/value pair where one exists', () => {
      const map: Map = new Map();

      map.set(1, 'hello');
      map.set(1, 'goodbye');

      expect(map.get(1)).to.equal('goodbye');
    });
  });

  describe('values()', () => {
    it('should return an array of values in the Map', () => {
      const map: Map = new Map();

      map.set(1, 'hello');
      map.set(2, 'goodbye');
      map.set(3, 'okay');

      expect(map.values()).to.deep.equal([ 'hello', 'goodbye', 'okay' ]);
    });
  });
});
