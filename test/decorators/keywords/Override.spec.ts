import { expect } from 'chai';
import { Override } from '../../../source';
import 'mocha';

describe('@Override', () => {
  it('should throw an error when decorating methods which are not overrides', () => {
    class A { }

    expect(() => {
      class B extends A {
        @Override public method (): void { }
      }
    }).to.throw(Error);
  });

  it('should have the same behavior on static methods', () => {
    class A { }

    expect(() => {
      class B extends A {
        @Override public static staticMethod (): void { }
      }
    }).to.throw(Error);
  });

  it('should work on methods twice or more removed in the inheritance hierarchy', () => {
    class A {
      public method (): void { }
    }

    class StaticA {
      public static staticMethod (): void { }
    }

    class B extends A { }
    class StaticB extends StaticA { }

    expect(() => {
      class C extends B {
        @Override public method (): void { }
      }

      class StaticC extends StaticB {
        @Override public static staticMethod(): void { }
      }
    }).to.not.throw(Error);
  });
});
