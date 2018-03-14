import { Automated, Poll, Run } from '../../source';
import { expect } from 'chai';
import 'mocha';

describe('Automation Decorators', () => {
  describe('@Run()', () => {
    it('should automatically run a decorated instance method after instantiation', () => {
      @Automated class A {
        public message: string;

        @Run('This is class A!')
        public setMessage (message: string): void {
          this.message = message;
        }
      }

      const a: A = new A();

      expect(a.message).to.equal('This is class A!');
    });

    it('should automatically run a decorated static method at runtime', () => {
      @Automated class A {
        public static message: string;

        @Run('This is a static message!')
        public static setStaticMessage (message: string): void {
          A.message = message;
        }
      }

      expect(A.message).to.equal('This is a static message!');
    });
  });

  describe('@Poll()', () => {
    it('should repeatedly run a decorated instance method at the specified interval after instantiation', (done) => {
      @Automated class A {
        public count: number = 0;

        @Poll(100)
        public countToFive (): void {
          if (this.count <= 5) {
            this.count++;
          }
        }
      }

      const a: A = new A();

      setTimeout(() => {
        expect(a.count).to.equal(5);
        done();
      }, 600);
    });

    it('should repeatedly run a decorated static method at the specified interval at runtime', (done) => {
      @Automated class A {
        public static count: number = 0;

        @Poll(100)
        public static staticCountToFive (): void {
          if (A.count <= 5) {
            A.count++;
          }
        }
      }

      setTimeout(() => {
        expect(A.count).to.equal(5);
        done();
      }, 600);
    });
  });
});
