/**
 * A key-value map of strings or numbers to values of type V.
 */
export interface IHashMap<V> {
  [key: string]: V;
  [key: number]: V;
}

/**
 * An instantiable (non-abstract) class Constructor.
 */
export interface IConstructable<T> {
  new (...args: any[]): T;
}

/**
 * A union of both an IConstructable and a traditional constructor
 * function, which can annotate the type of either an abstract or
 * a non-abstract class Constructor.
 */
export type Constructor<T> = IConstructable<T> | Function & { prototype: T };

/**
 * An object with at least the type signature of T, and potentially
 * additional properties.
 */
export type Extension<T> = T & IHashMap<any>;

/**
 * A function which takes arguments of type T and returns U.
 */
export type Method<T, U = any> = (...args: T[]) => U;

/**
 * A type alias of Method for callback-specific scenarios.
 */
export type Callback<T, U = any> = Method<T, U>;
