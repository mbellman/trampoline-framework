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
    addOne();
    a.addOne();
    a.addOne();

    expect(a.count).to.equal(4);
  });

  it('should bind the context of all methods of a decorated class', () => {
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
});
