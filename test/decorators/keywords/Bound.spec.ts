import { Bound } from '../../../source';
import { expect } from 'chai';
import 'mocha';

describe('@Bound', () => {
  it('should bind the context of decorated methods to class instances', () => {
    class A {
      public count: number = 0;

      @Bound public addOne (): void {
        this.count++;
      }
    }

    const a: A = new A();
    const { addOne } = a;

    addOne();
    a.addOne();

    expect(a.count).to.equal(2);
  });

  it('should bind the context of all instance methods of decorated classes', () => {
    @Bound class A {
      public count: number = 0;

      public addOne (): void {
        this.count++;
      }

      public addTwo (): void {
        this.count += 2;
      }

      public addThree (): void {
        this.count += 3;
      }
    }

    const a: A = new A();
    const { addOne, addTwo, addThree } = a;

    addOne();
    addTwo();
    addThree();

    expect(a.count).to.equal(6);
  });

  it('should throw errors on decorated static methods', () => {
    expect(() => {
      class A {
        @Bound public static method (): void { }
      }
    }).to.throw(Error);
  });
});
