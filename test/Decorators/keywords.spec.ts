import { expect } from 'chai';
import { Final, IConstructable } from '../../source';
import 'mocha';

describe('Keyword Decorators', () => {
  describe('@Final', () => {
    describe('As a class decorator', () => {
      it('should cause classes extending the target to throw Errors', () => {
        @Final class A { }

        expect(() => {
          class B extends A { }
        }).to.throw(Error);
      });

      it('should cause instantiation from other constructors to throw Errors', () => {
        @Final class A { }
        class NotA { }

        expect(() => A.apply(new NotA())).to.throw(Error);
      });

      it('should otherwise preserve normal class behavior', () => {
        @Final class A {
          private static staticMessage: string = 'Static message!';
          public message: string;

          public static getStaticMessage (): string {
            return A.staticMessage;
          }

          public constructor (message: string) {
            this.message = message;
          }

          public getMessage (): string {
            return this.message;
          }
        }

        expect(A.getStaticMessage()).to.equal('Static message!');
        expect(new A('hello').getMessage()).to.equal('hello');
      });
    });

    describe('As a method decorator', () => {
      it('should throw an error when attempting to override a base class method', () => {
        class A {
          @Final public getClass (): string {
            return 'Class A!';
          }
        }

        expect(() => {
          class B extends A {
            public getClass (): string {
              return 'Class B!';
            }
          }
        }).to.throw(Error);
      });

      it('should otherwise preserve normal method behavior', () => {
        class A {
          public count: number = 0;

          @Final public addOne (): void {
            this.count++;
          }
        }

        const a: A = new A();

        a.addOne();
        a.addOne();
        a.addOne();

        expect(a.count).to.equal(3);
      });
    });
  });
});
