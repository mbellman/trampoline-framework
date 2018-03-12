import { expect } from 'chai';
import { Singleton } from '../../source';
import 'mocha';

describe('Singleton', () => {
  it('should only expose one instance', () => {
    class A extends Singleton {
      public getMessage (): string {
        return 'hi';
      }
    }
  });
});
