import 'reflect-metadata';

export type MetaDataGetter<T> = (target: any) => T;
export type MetaDataDefiner<T> = (target: any, metaData: T) => void;

export function createOwnMetadataGetter <T>(key: string | symbol, fallback?: T): MetaDataGetter<T> {
  return (target: any) => Reflect.getOwnMetadata(key, target) || fallback;
}

export function createMetadataDefiner <T>(key: string | symbol): MetaDataDefiner<T> {
  return (target: any, metaData: T) => Reflect.defineMetadata(key, metaData, target);
}
