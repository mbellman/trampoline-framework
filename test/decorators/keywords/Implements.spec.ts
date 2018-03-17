import { expect } from 'chai';
import { Implements } from '../../../source';
import 'mocha';

describe('@Implements', () => {
  it('should throw an error when decorating existing superclass methods', () => {
    class A {
      public method (): void { }
    }

    expect(() => {
      class B extends A {
        @Implements public method (): void { }
      }
    }).to.throw(Error);
  });

  it('should have the same behavior on static methods', () => {
    class A {
      public static staticMethod (): void { }
    }

    expect(() => {
      class B extends A {
        @Implements public static staticMethod (): void { }
      }
    }).to.throw(Error);
  });
});
