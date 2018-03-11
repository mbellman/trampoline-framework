import { createMetadataDefiner, createOwnMetadataGetter, MetaDataDefiner, MetaDataGetter } from './reflection-helpers';
import { IConstructable, IHashMap } from '../Types/standard-types';
import { DecoratorTarget } from '../Types/decorator-types';

const autowirableMembersKey = Symbol('autowirable-members');
const autowirableParametersKey = Symbol('autowirable-parameters');

type AutowirableSaver<T> = (
  target: any,
  autowirableValue: T
) => void;

function createAutowirableSaver <T extends IAutowirable>(
  getAutowirables: MetaDataGetter<T[]>,
  defineAutowirables: MetaDataDefiner<T[]>
): AutowirableSaver<T> {
  return (
    target: any,
    autowirableValue: T
  ) => {
    const autowirables: T[] = getAutowirables(target);

    autowirables.push(autowirableValue);

    defineAutowirables(target, autowirables);
  };
}

export interface IAutowirable {
  type: IConstructable;
  constructorArgs: any[];
}

export interface IAutowirableMember extends IAutowirable {
  memberName: string;
}

export interface IAutowirableParameter extends IAutowirable {
  methodName: string;
  parameterIndex: number;
}

export const getAutowirableMembers = createOwnMetadataGetter<IAutowirableMember[]>(autowirableMembersKey, []);
export const getAutowirableParameters = createOwnMetadataGetter<IAutowirableParameter[]>(autowirableParametersKey, []);
export const defineAutowirableMembers = createMetadataDefiner<IAutowirableMember[]>(autowirableMembersKey);
export const defineAutowirableParameters = createMetadataDefiner<IAutowirableParameter[]>(autowirableParametersKey);
export const saveAutowirableMember = createAutowirableSaver(getAutowirableMembers, defineAutowirableMembers);
export const saveAutowirableParameter = createAutowirableSaver(getAutowirableParameters, defineAutowirableParameters);
