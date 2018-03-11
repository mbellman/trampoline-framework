import { clone } from '../Internals/object-utils';
import 'reflect-metadata';

/**
 * @internal
 */
export type MetaDataGetter<T> = (
  target: any,
  propertyKey?: string | symbol
) => T;

/**
 * @internal
 */
export type MetaDataDefiner<T> = (
  target: any,
  metaData: T
) => void;

/**
 * @internal
 */
export function createOwnMetadataGetter <T>(
  key: string | symbol,
  defaultData?: T
): MetaDataGetter<T> {
  return (
    target: any,
    propertyKey?: string | symbol
  ) => {
    const metaData = propertyKey
      ? Reflect.getOwnMetadata(key, target, propertyKey)
      : Reflect.getOwnMetadata(key, target);

    return metaData || clone(defaultData);
  };
}

/**
 * @internal
 */
export function createMetadataDefiner <T>(
  key: string | symbol
): MetaDataDefiner<T> {
  return (
    target: any,
    metaData: T
  ) => Reflect.defineMetadata(key, metaData, target);
}

/**
 * @internal
 */
export function getReflectedPropertyType (
  target: any,
  propertyKey: string | symbol
): any {
  return Reflect.getMetadata('design:type', target, propertyKey);
}

/**
 * @internal
 */
export function getReflectedMethodParameterTypes (
  target: any,
  methodName: string | symbol
): any[] {
  return Reflect.getMetadata('design:paramtypes', target, methodName);
}
