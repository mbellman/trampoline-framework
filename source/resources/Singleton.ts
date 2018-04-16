/**
 * A class which provides Singleton pattern behavior to extending
 * classes. Contention about Singletons aside, this at least saves
 * the trouble of implementing the pattern for every Singleton class.
 *
 * ```
 * class A extends Singleton { }
 *
 * // Throws Error
 * const a: A = new A();
 *
 * const a: A = A.getInstance();
 * ```
 */
export default abstract class Singleton {
  private static readonly CONSTRUCTOR_SYMBOL: unique symbol = Symbol('singleton');
  private static instance: Singleton;

  protected constructor (
    symbol: symbol
  ) {
    if (symbol !== Singleton.CONSTRUCTOR_SYMBOL) {
      throw new Error('Singleton construction not allowed! Use getInstance() to resolve an instance of this Singleton.');
    }
  }

  public static getInstance <T extends Singleton>(): T {
    if (this.instance) {
      return this.instance as T;
    }

    const { prototype } = this;
    const instance = prototype.constructor.call(Object.create(prototype), Singleton.CONSTRUCTOR_SYMBOL);

    this.instance = instance;

    return instance as T;
  }
}
