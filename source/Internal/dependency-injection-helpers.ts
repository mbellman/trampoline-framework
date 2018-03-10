import { createMetadataDefiner, createOwnMetadataGetter, MetaDataDefiner, MetaDataGetter } from '../Internal/reflection-helpers';
import { IConstructable, IHashMap } from '../Types';

const autowirableMembersKey = Symbol('autowirable-members');
const autowirableParametersKey = Symbol('autowirable-parameters');

type AutowirableSaver<T> = (constructable: IConstructable, autowirableValue: T) => void;

function createAutowirableSaver <T extends IAutowirable>(getter: MetaDataGetter<T[]>, definer: MetaDataDefiner<T[]>): AutowirableSaver<T> {
  return (constructable: IConstructable, autowirableValue: T) => {
    const autowirables: T[] = getter(constructable);

    autowirables.push(autowirableValue);

    definer(constructable, autowirables);
  };
}

export interface IAutowirable {
  type: IConstructable;
  constructorArgs: any[];
}

export interface IAutowirableMember extends IAutowirable {
  name: string;
}

export interface IAutowirableParameter extends IAutowirable {
  method: string;
  parameterIndex: number;
}

export const getAutowirableMembers = createOwnMetadataGetter<IAutowirableMember[]>(autowirableMembersKey, []);
export const getAutowirableParameters = createOwnMetadataGetter<IAutowirableParameter[]>(autowirableParametersKey, []);
export const defineAutowirableMembers = createMetadataDefiner<IAutowirableMember[]>(autowirableMembersKey);
export const defineAutowirableParameters = createMetadataDefiner<IAutowirableParameter[]>(autowirableParametersKey);
export const saveAutowirableMember = createAutowirableSaver(getAutowirableMembers, defineAutowirableMembers);
export const saveAutowirableParameter = createAutowirableSaver(getAutowirableParameters, defineAutowirableParameters);
