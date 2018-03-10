export type MultiMapEntry<K, V> = [K, V[]];
export type MultiMapIterable<K, V> = MultiMapEntry<K, V>[];
export type MultiMapIterationHandler<K, V> = (values: V[], key: K, multiMap: MultiMap<K, V>) => void;

export class MultiMap<K = any, V = any> {
  private _keys: K[] = [];
  private _valueIterables: V[][] = [];

  public constructor (iterable: MultiMapIterable<K, V> = []) {
    for (let i = 0; i < iterable.length; i++) {
      const entry: MultiMapEntry<K, V> = iterable[i];

      this._keys[i] = entry[0];
      this._valueIterables[i] = entry[1];
    }
  }

  public get size (): number {
    return this._keys.length;
  }

  public clear (): void {
    this._keys.length = 0;
    this._valueIterables.length = 0;
  }

  public forEach (handler: MultiMapIterationHandler<K, V>): void {
    this._keys.forEach((key: K, i: number) => {
      const values: V[] = this._valueIterables[i];

      handler(values, key, this);
    });
  }

  public get (key: K): V[] {
    const keyIndex: number = this._keys.indexOf(key);

    return this._valueIterables[keyIndex];
  }

  public has (key: K): boolean {
    return this._keys.indexOf(key) > -1;
  }

  public put (key: K, value: V): void {
    const keyIndex: number = this._keys.indexOf(key);

    if (keyIndex > -1) {
      const values: V[] = this._valueIterables[keyIndex];

      values.push(value);
    } else {
      this._keys.push(key);
      this._valueIterables.push([value]);
    }
  }

  public remove (key: K, value?: V): void {
    const keyIndex: number = this._keys.indexOf(key);

    if (keyIndex > -1) {
      if (value) {
        const values: V[] = this._valueIterables[keyIndex];
        const valueIndex: number = values.indexOf(value);

        if (valueIndex > -1) {
          values.splice(valueIndex, 1);
        }
      } else {
        this._keys.splice(keyIndex, 1);
        this._valueIterables.splice(keyIndex, 1);
      }
    }
  }
}
