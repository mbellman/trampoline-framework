export type MapEntry<K, V> = [K, V];
export type MapIterable<K, V> = MapEntry<K, V>[];
export type MapIterationHandler<K, V> = (value: V, key: K, map: Map<K, V>) => void;

export class Map<K = any, V = any> {
  private _keys: K[] = [];
  private _values: V[] = [];

  public constructor (
    entries: MapIterable<K, V> = []
  ) {
    for (let i = 0; i < entries.length; i++) {
      const entry: MapEntry<K, V> = entries[i];

      this._keys[i] = entry[0];
      this._values[i] = entry[1];
    }
  }

  public get size (): number {
    return this._keys.length;
  }

  public clear (): void {
    this._keys.length = 0;
    this._values.length = 0;
  }

  public delete (
    key: K
  ): void {
    const keyIndex: number = this._keys.indexOf(key);

    if (keyIndex > -1) {
      this._keys.splice(keyIndex, 1);
      this._values.splice(keyIndex, 1);
    }
  }

  public entries (): MapIterable<K, V> {
    return this._keys.map((key: K, i: number) => {
      return [key, this._values[i]] as MapEntry<K, V>;
    });
  }

  public forEach (
    handler: MapIterationHandler<K, V>
  ): void {
    this._keys.forEach((key: K, i: number) => {
      const value: V = this._values[i];

      handler(value, key, this);
    });
  }

  public get (
    key: K
  ): V {
    const keyIndex: number = this._keys.indexOf(key);

    return this._values[keyIndex];
  }

  public has (
    key: K
  ): boolean {
    return this._keys.indexOf(key) > -1;
  }

  public keys (): K[] {
    return this._keys.slice(0);
  }

  public set (
    key: K,
    value: V
  ): void {
    const keyIndex: number = this._keys.indexOf(key);

    if (keyIndex > -1) {
      this._values[keyIndex] = value;
    } else {
      this._keys.push(key);
      this._values.push(value);
    }
  }

  public values (): V[] {
    return this._values.slice(0);
  }
}
