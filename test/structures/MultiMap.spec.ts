import { expect } from 'chai';
import { MultiMap, MultiMapIterable, MultiMapEntry } from '../../source';
import 'mocha';

describe('MultiMap', () => {
  describe('Constructor', () => {
    it('should return a MultiMap instance', () => {
      const multiMap: MultiMap = new MultiMap();

      expect(multiMap).to.be.an.instanceof(MultiMap);
    });

    it('should take a MapIterable as a parameter', () => {
      const iterable: MultiMapIterable<number, string> = [
        [ 1, [ 'hello' ] ],
        [ 2, [ 'goodbye' ] ]
      ];

      const multiMap: MultiMap<number, string> = new MultiMap(iterable);

      expect(multiMap.get(1)).to.deep.equal([ 'hello' ]);
      expect(multiMap.get(2)).to.deep.equal([ 'goodbye' ]);
    });
  });

  describe('size', () => {
    it('should return the number of MultiMap entries', () => {
      const multiMap: MultiMap = new MultiMap();

      multiMap.put(1, 'hello');
      multiMap.put(2, 'goodbye');

      expect(multiMap.size).to.equal(2);
    });
  });

  describe('clear()', () => {
    it('should remove all entries from the MultiMap', () => {
      const multiMap: MultiMap = new MultiMap();

      multiMap.put(1, 'hello');
      multiMap.put(2, 'goodbye');

      multiMap.clear();

      expect(multiMap.size).to.equal(0);
      expect(multiMap.get(1)).to.be.undefined;
      expect(multiMap.get(2)).to.be.undefined;
    });
  });

  describe('entries()', () => {
    it('should return all entries from the MultiMap', () => {
      const multiMap: MultiMap = new MultiMap();

      multiMap.put(1, 'hello');
      multiMap.put(2, 'goodbye');

      const entries = multiMap.entries();

      expect(entries).to.deep.equal([
        [1, ['hello']],
        [2, ['goodbye']]
      ]);
    });
  });

  describe('forEach(handler)', () => {
    it('should iterate over each key/values pair in the MultiMap and call the handler with the appropriate arguments', () => {
      const iterable: MultiMapIterable<number, string> = [
        [ 1, [ 'hello' ] ],
        [ 2, [ 'goodbye' ] ]
      ];

      const multiMap: MultiMap<number, string> = new MultiMap(iterable);
      let i: number = 0;

      multiMap.forEach((values: string[], key: number, multiMapReference: MultiMap<number, string>) => {
        expect(values).to.deep.equal(iterable[i][1]);
        expect(key).to.equal(iterable[i][0]);
        expect(multiMapReference).to.equal(multiMap);

        i++;
      });
    });
  });

  describe('get(key)', () => {
    it('should return the values for {key}', () => {
      const multiMap: MultiMap = new MultiMap();

      multiMap.put(1, 'hello');
      multiMap.put(1, 'howdy');
      multiMap.put(2, 'goodbye');
      multiMap.put(2, 'see ya');

      expect(multiMap.get(1)).to.deep.equal([ 'hello', 'howdy' ]);
      expect(multiMap.get(2)).to.deep.equal([ 'goodbye', 'see ya' ]);
    });
  });

  describe('has(key)', () => {
    it('should return a boolean determining whether a key/values pair exists for {key}', () => {
      const multiMap: MultiMap = new MultiMap();

      multiMap.put(1, 'hello');
      multiMap.put(2, 'goodbye');

      expect(multiMap.has(1)).to.be.true;
      expect(multiMap.has(2)).to.be.true;
      expect(multiMap.has(3)).to.be.false;
    });
  });

  describe('put(key, value)', () => {
    it('should add a new key/values entry to the MultiMap if one does not exist', () => {
      const multiMap: MultiMap = new MultiMap();

      multiMap.put(1, 'hello');

      expect(multiMap.get(1)).to.deep.equal([ 'hello' ]);
    });

    it('should add additional entries to the values list for {key}', () => {
      const multiMap: MultiMap = new MultiMap();

      multiMap.put(1, 'hello');
      multiMap.put(1, 'goodbye');
      multiMap.put(1, 'okay');

      expect(multiMap.get(1)).to.deep.equal([ 'hello', 'goodbye', 'okay' ]);
    });
  });

  describe('remove(key, value?)', () => {
    it('should remove a {value} from the values list for {key}', () => {
      const multiMap: MultiMap = new MultiMap();

      multiMap.put(1, 'hello');
      multiMap.put(1, 'goodbye');
      multiMap.put(1, 'okay');

      multiMap.remove(1, 'goodbye');

      expect(multiMap.get(1)).to.deep.equal([ 'hello', 'okay' ]);
    });

    it('should remove the entry for {key} when a {value} is not specified', () => {
      const multiMap: MultiMap = new MultiMap();

      multiMap.put(1, 'hey');
      multiMap.put(2, 'hello');
      multiMap.put(2, 'goodbye');
      multiMap.put(2, 'okay');

      multiMap.remove(2);

      expect(multiMap.get(2)).to.be.undefined;
      expect(multiMap.size).to.equal(1);
    });

    it('should do nothing when trying to remove a nonexistent {value} for a {key}', () => {
      const multiMap: MultiMap = new MultiMap();

      multiMap.put(1, 'hello');
      multiMap.put(1, 'goodbye');
      multiMap.remove(1, 'hey');

      expect(multiMap.size).to.equal(1);
      expect(multiMap.get(1)).to.deep.equal([ 'hello', 'goodbye' ]);
    });

    it('should do nothing when trying to remove a nonexistent {key}', () => {
      const multiMap: MultiMap = new MultiMap();

      multiMap.remove(1);

      expect(multiMap.size).to.equal(0);
      expect(multiMap.get(1)).to.be.undefined;
    });
  });
});
