import { expect } from 'chai';
import { Unfinished } from '../../../source';
import 'mocha';

describe('@Unfinished()', () => {
  it('should cause decorated methods to return null', () => {
    class A {
      @Unfinished()
      public static staticMethod (): void { }

      @Unfinished('Still working on this.')
      public method (): void { }
    }

    const a: A = new A();

    expect(a.method()).to.be.null;
    expect(A.staticMethod()).to.be.null;
  });

  it('should cause all methods on decorated classes to return null', () => {
    @Unfinished(`This one's taking a while.`)
    class A {
      public static staticMethod (): void { }
      public method (): void { }
    }

    const a: A = new A();

    expect(a.method()).to.be.null;
    expect(A.staticMethod()).to.be.null;
  });
});
