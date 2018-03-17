import { expect } from 'chai';
import { Unfinished } from '../../../source';
import 'mocha';

describe('@Unfinished()', () => {
  it('should cause decorated methods to throw an error when called', () => {
    class A {
      @Unfinished()
      public static staticMethod (): void { }

      @Unfinished('Still working on this.')
      public method (): void { }
    }

    const a: A = new A();

    expect(() => a.method()).to.throw(Error);
    expect(() => A.staticMethod()).to.throw(Error);
  });

  it('should cause decorated classes to throw an error when instantiated', () => {
    @Unfinished(`This one's taking a while.`)
    class A {
      public method (): void { }
    }

    expect(() => {
      const a: A = new A();
    }).to.throw(Error);
  });

  it('should cause static methods of decorated classes to throw an error when called', () => {
    @Unfinished(`This one's taking a while.`)
    class A {
      public static staticMethod (): void { }
    }

    expect(() => A.staticMethod()).to.throw(Error);
  });
});
