import { Autowired, Wired } from '../../source';
import { expect } from 'chai';
import 'mocha';

class A {
  public input: string = 'default input';

  public constructor (input: string) {
    this.input = input;
  }
}

describe('Dependency Injection', () => {
  describe('@Autowired() {field}: T', () => {
    it('should inject a new T instance into {field} on instantiation', () => {
      @Wired
      class B {
        @Autowired() public a: A;
      }

      const b: B = new B();

      expect(b.a).to.be.an.instanceof(A);
    });

    it('Should pass the provided arguments to the autowired T instance', () => {
      @Wired
      class B {
        @Autowired('hello') public a: A;
      }

      const b: B = new B();

      expect(b.a.input).to.equal('hello');
    });
  });
});
