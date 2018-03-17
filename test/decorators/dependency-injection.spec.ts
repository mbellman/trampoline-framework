import { Autowired, IConstructable, Wired } from '../../source';
import { expect } from 'chai';
import 'mocha';

class A {
  public input: string;

  public constructor (input: string = 'default input') {
    this.input = input;
  }
}

describe('Dependency Injection Decorators', () => {
  describe('Property autowiring', () => {
    it('should inject a new T instance into autowired instance properties on instantiation', () => {
      @Wired class B {
        @Autowired() public a: A;
      }

      const b: B = new B();

      expect(b.a).to.be.an.instanceof(A);
    });

    it('should inject a new T instance into autowired static properties at runtime', () => {
      @Wired class B {
        @Autowired('hello') public static a: A;
      }

      expect(B.a.input).to.equal('hello');
    });

    it('Should pass the provided arguments to the autowired T instance', () => {
      @Wired class B {
        @Autowired('hello') public a: A;
      }

      @Wired class StaticB {
        @Autowired('goodbye') public static a: A;
      }

      const b: B = new B();

      expect(b.a.input).to.equal('hello');
      expect(StaticB.a.input).to.equal('goodbye');
    });
  });

  describe('Parameter autowiring', () => {
    it('Should autowire method parameters', () => {
      @Wired class B {
        public a1: A;
        public a2: A;
        public static staticA: A;

        public constructor (@Autowired('hello') a?: A) {
          if (a) {
            this.a1 = a;
          }
        }

        public method (@Autowired('goodbye') a?: A) {
          if (a) {
            this.a2 = a;
          }
        }

        public static staticMethod (@Autowired('hey') a?: A): void {
          if (a) {
            B.staticA = a;
          }
        }
      }

      const b: B = new B();

      b.method();
      B.staticMethod();

      expect(b.a1.input).to.equal('hello');
      expect(b.a2.input).to.equal('goodbye');
      expect(B.staticA.input).to.equal('hey');
    });
  });

  it('should throw an error when trying to autowire a non-constructable type', () => {
    expect(() => {
      @Wired class B {
        @Autowired() public struct: null;
      }
    }).to.throw(Error);
  });
});
