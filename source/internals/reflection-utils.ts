import { clone } from '../internals/object-utils';
import { Constructor } from '../types/standard-types';
import 'reflect-metadata';

/**
 * @internal
 */
function createOwnMetadataGetter <T>(
  key: string | symbol,
  defaultMetadata?: T[]
): MetadataGetter<T> {
  return (target: any, propertyKey?: string | symbol) => {
    const metaData = propertyKey
      ? Reflect.getOwnMetadata(key, target, propertyKey)
      : Reflect.getOwnMetadata(key, target);

    return metaData || clone(defaultMetadata);
  };
}

/**
 * @internal
 */
function createMetadataDefiner <T>(
  key: string | symbol
): MetadataDefiner<T> {
  return (target: any, metaData: T) => Reflect.defineMetadata(key, metaData, target);
}

/**
 * @internal
 */
function createMetadataAdder <T>(
  get: MetadataGetter<T[]>,
  define: MetadataDefiner<T[]>
): MetadataDefiner<T> {
  return (target: any, item: T) => {
    const metaData: T[] = get(target) || [];

    metaData.push(item);

    define(target, metaData);
  };
}

/**
 * @internal
 */
export type MetadataGetter<T> = (
  target: any,
  propertyKey?: string | symbol
) => T;

/**
 * @internal
 */
export type MetadataDefiner<T> = (
  target: any,
  metaData: T
) => void;

/**
 * @internal
 */
export interface IMetadataStore<T> {
  get: MetadataGetter<T[]>;
  define: MetadataDefiner<T[]>;
  add: MetadataDefiner<T>;
}

/**
 * @internal
 */
export interface IClassTaxonomy {
  name: string;
  prototype: any;
  parentName: string;
}

/**
 * @internal
 */
export function createMetadataStore <T>(
  key: string | symbol
): IMetadataStore<T> {
  const get = createOwnMetadataGetter<T[]>(key, []);
  const define = createMetadataDefiner<T[]>(key);
  const add = createMetadataAdder(get, define);

  return {
    get,
    define,
    add
  };
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

/**
 * @internal
 */
export function getClassTaxonomy <T>(
  classConstructor: Constructor
): IClassTaxonomy {
  const prototype = Object.getPrototypeOf(classConstructor);
  const { name } = classConstructor;
  const { name: parentName } = prototype;

  return {
    name,
    prototype,
    parentName
  };
}
