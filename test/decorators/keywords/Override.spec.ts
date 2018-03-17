import { expect } from 'chai';
import { Override } from '../../../source';
import 'mocha';

describe('@Override', () => {
  it('should throw an error when decorating non-overriding methods', () => {
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
});
