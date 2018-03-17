import { expect } from 'chai';
import { Singleton } from '../../source';
import 'mocha';

describe('Singleton', () => {
  it('should only expose one instance', () => {
    class A extends Singleton {
      public count: number = 0;

      public addOne (): void {
        this.count++;
      }
    }

    const a1: A = A.getInstance();
    const a2: A = A.getInstance();

    a1.addOne();
    a2.addOne();

    expect(a1).to.equal(a2);
    expect(a1.count).to.equal(2);
    expect(a2.count).to.equal(2);
  });

  it('should preserve normal class behavior', () => {
    class A extends Singleton {
      public count: number = 0;

      public addOne (): void {
        this.count++;
      }

      public getMessage (): string {
        return 'Hello.';
      }
    }

    const a: A = A.getInstance();

    a.addOne();
    a.addOne();

    expect(a.count).to.equal(2);
    expect(a.getMessage()).to.equal('Hello.');
  });

  it('should resolve separate Singletons for multiple extending classes', () => {
    class A extends Singleton { }
    class B extends Singleton { }

    const a: A = A.getInstance();
    const b: B = B.getInstance();

    expect(a).to.not.equal(b);
    expect(a).to.be.an.instanceof(A);
    expect(b).to.be.an.instanceof(B);
  });

  it('should throw an error when trying to construct a Singleton instance without the proper Symbol', () => {
    class A extends Singleton { }

    expect(() => {
      const a: A = A.apply({});
    }).to.throw(Error);
  });
});
