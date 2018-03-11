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
  describe('@Autowired(...args) {field}: T', () => {
    it('should inject a new T instance into {field} on instantiation', () => {
      @Wired class B {
        @Autowired() public a: A;
      }

      const b: B = new B();

      expect(b.a).to.be.an.instanceof(A);
    });

    it('Should pass the provided arguments to the autowired T instance', () => {
      @Wired class B {
        @Autowired('hello') public a: A;
      }

      const b: B = new B();

      expect(b.a.input).to.equal('hello');
    });
  });

  describe('@Autowired() {param}: T', () => {
    it('Should autowire method parameters', () => {
      @Wired class B {
        public a1: A;
        public a2: A;

        public constructor (@Autowired('hello') a: A) {
          this.a1 = a;
        }

        public method (@Autowired('goodbye') a: A) {
          this.a2 = a;
        }
      }

      class Factory<T> {
        private _ctor: IConstructable<T>;

        public constructor (ctor: IConstructable<T>) {
          this._ctor = ctor;
        }

        public create (...args: any[]): T {
          return new this._ctor(...args);
        }
      }

      const bFactory: Factory<B> = new Factory(B);
      const b: B = bFactory.create();

      b.method.call(b);

      expect(b.a1.input).to.equal('hello');
      expect(b.a2.input).to.equal('goodbye');
    });
  });
});
