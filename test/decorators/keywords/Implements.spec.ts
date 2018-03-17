import { expect } from 'chai';
import { Implements } from '../../../source';
import 'mocha';

describe('@Implements', () => {
  it('should throw an error when decorating methods with existing supers', () => {
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
        @Implements public method (): void { }
      }
    }).to.throw(Error);

    expect(() => {
      class StaticC extends StaticB {
        @Implements public static staticMethod (): void { }
      }
    }).to.throw(Error);
  });
});
