import { Constructor, IConstructable, IHashMap } from '../Types';
import { Map } from '../Structures';
import 'reflect-metadata';

interface IAutowiredMember {
  name: string;
  type: IConstructable<any>;
  constructorArgs: any[];
}

const autowiredMembersKey = Symbol('autowired');

function getAutowiredMembers (constructable: IConstructable<any>): IAutowiredMember[] {
  return Reflect.getOwnMetadata(autowiredMembersKey, constructable) || [];
}

function setAutowiredMembers (constructable: IConstructable<any>, autowiredMembers: IAutowiredMember[]): void {
  Reflect.defineMetadata(autowiredMembersKey, autowiredMembers, constructable);
}

function saveAutowiredMember (constructable: IConstructable<any>, name: string, type: IConstructable<any>, constructorArgs: any[]): void {
  const autowiredMembers = getAutowiredMembers(constructable);

  autowiredMembers.push({
    name,
    type,
    constructorArgs
  });

  setAutowiredMembers(constructable, autowiredMembers);
}

export function Autowired (...constructorArgs: any[]): PropertyDecorator {
  return (ownerClass: any, memberName: string | symbol) => {
    const { constructor: constructable } = ownerClass;
    const memberType: IConstructable<any> = Reflect.getMetadata('design:type', ownerClass, memberName);

    saveAutowiredMember(constructable, memberName as string, memberType, constructorArgs);
  };
}

export function Wired (constructable: IConstructable<any>): IConstructable<any> {
  return class WiredClass extends constructable {
    public constructor () {
      super(...arguments);

      getAutowiredMembers(constructable).forEach(({ name, type, constructorArgs }) => {
        this[name] = new type(...constructorArgs);
      });
    }
  };
}
