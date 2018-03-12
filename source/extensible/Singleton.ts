/**
 * A class which provides Singleton pattern behavior to extending
 * classes. Contention about Singletons aside, this at least makes
 * it unnecessary to implement the pattern for every Singleton class.
 */
export default abstract class Singleton {
  private static readonly CONSTRUCTOR_SYMBOL: unique symbol = Symbol('singleton');
  private static readonly INSTANCE_KEY: unique symbol = Symbol('instance');
  private static [Singleton.INSTANCE_KEY]: Singleton;

  protected constructor (symbol: symbol) {
    if (symbol !== Singleton.CONSTRUCTOR_SYMBOL) {
      throw new Error('Singleton construction not allowed! Use getInstance() to resolve an instance of this Singleton.');
    }
  }

  public static getInstance <T extends Singleton>(): T {
    if (this[Singleton.INSTANCE_KEY]) {
      return this[Singleton.INSTANCE_KEY] as T;
    }

    const { prototype } = this;
    const instance = prototype.constructor.call(Object.create(prototype), Singleton.CONSTRUCTOR_SYMBOL);

    this[Singleton.INSTANCE_KEY] = instance;

    return instance as T;
  }
}
