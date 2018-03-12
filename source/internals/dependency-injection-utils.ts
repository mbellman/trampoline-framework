import { createMetadataDefiner, createOwnMetadataGetter, MetaDataDefiner, MetaDataGetter } from './reflection-utils';
import { DecoratorTarget } from '../types/decorator-types';
import { IConstructable, IHashMap } from '../types/standard-types';

const AUTOWIRABLE_MEMBERS_KEY = Symbol('autowirable-members');
const AUTOWIRABLE_PARAMETERS_KEY = Symbol('autowirable-parameters');

/**
 * @internal
 */
type AutowirableSaver<T> = (
  target: any,
  autowirableValue: T
) => void;

/**
 * @internal
 */
function createAutowirableSaver <T extends IAutowirable>(
  getAutowirables: MetaDataGetter<T[]>,
  defineAutowirables: MetaDataDefiner<T[]>
): AutowirableSaver<T> {
  return (target: any, autowirableValue: T) => {
    const autowirables: T[] = getAutowirables(target);

    autowirables.push(autowirableValue);

    defineAutowirables(target, autowirables);
  };
}

/**
 * @internal
 */
export interface IAutowirable {
  type: IConstructable;
  constructorArgs: any[];
}

/**
 * @internal
 */
export interface IAutowirableMember extends IAutowirable {
  memberName: string;
}

/**
 * @internal
 */
export interface IAutowirableParameter extends IAutowirable {
  methodName: string;
  parameterIndex: number;
}

/**
 * @internal
 */
export const getAutowirableMembers = createOwnMetadataGetter<IAutowirableMember[]>(AUTOWIRABLE_MEMBERS_KEY, []);

/**
 * @internal
 */
export const getAutowirableParameters = createOwnMetadataGetter<IAutowirableParameter[]>(AUTOWIRABLE_PARAMETERS_KEY, []);

/**
 * @internal
 */
export const defineAutowirableMembers = createMetadataDefiner<IAutowirableMember[]>(AUTOWIRABLE_MEMBERS_KEY);

/**
 * @internal
 */
export const defineAutowirableParameters = createMetadataDefiner<IAutowirableParameter[]>(AUTOWIRABLE_PARAMETERS_KEY);

/**
 * @internal
 */
export const saveAutowirableMember = createAutowirableSaver(getAutowirableMembers, defineAutowirableMembers);

/**
 * @internal
 */
export const saveAutowirableParameter = createAutowirableSaver(getAutowirableParameters, defineAutowirableParameters);
