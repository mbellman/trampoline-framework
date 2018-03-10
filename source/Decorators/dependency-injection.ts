import { getAutowirableMembers, getAutowirableParameters, IAutowirableParameter, saveAutowirableMember, saveAutowirableParameter } from '../Internal/dependency-injection-helpers';
import { IConstructable } from '../Types';
import { toArray } from '../Utils';

const CONSTRUCTOR_METHOD_ID = '__constructor__';

function autowireArguments (args: IArguments, autowirableParameters: IAutowirableParameter[]): any[] {
  const autowiredArgs = toArray(arguments);

  autowirableParameters.forEach(({ parameterIndex, type, constructorArgs }) => {
    autowiredArgs[parameterIndex] = new type(...constructorArgs);
  });

  return autowiredArgs;
}

function createWiredMethod (originalMethod: Function, methodAutowirableParameters: IAutowirableParameter[]) {
  return function () {
    const autowiredArguments = autowireArguments(arguments, methodAutowirableParameters);

    originalMethod.apply(this, autowiredArguments);
  };
}

function enableAutowirableParameterChecking (constructable: IConstructable): void {
  const allAutowirableParameters = getAutowirableParameters(constructable);

  Object.keys(constructable.prototype).forEach(methodName => {
    const methodAutowirableParameters = allAutowirableParameters.filter(({ method }) => method === methodName);

    if (methodAutowirableParameters.length > 0) {
      const originalMethod = constructable.prototype[methodName];

      constructable.prototype[methodName] = createWiredMethod(originalMethod, methodAutowirableParameters);
    }
  });
}

export function Autowired (...constructorArgs: any[]): PropertyDecorator & ParameterDecorator {
  return (target: any, propertyName: string | symbol, parameterIndex?: number) => {
    if (typeof parameterIndex === 'number') {
      // Parameter decorator
      const paramTypes: IConstructable[] = Reflect.getMetadata('design:paramtypes', target, propertyName);
      const methodName: string = propertyName ? propertyName as string : CONSTRUCTOR_METHOD_ID;

      saveAutowirableParameter(target.constructor, {
        type: paramTypes[parameterIndex],
        constructorArgs,
        method: methodName,
        parameterIndex
      });
    } else {
      // Property decorator
      const type: IConstructable = Reflect.getMetadata('design:type', target, propertyName);

      saveAutowirableMember(target.constructor, {
        type,
        constructorArgs,
        name: propertyName as string
      });
    }
  };
}

export function Wired (constructable: IConstructable): IConstructable {
  const autowirableConstructorParameters = getAutowirableParameters(constructable)
    .filter(({ method }) => method === CONSTRUCTOR_METHOD_ID);

  enableAutowirableParameterChecking(constructable);

  return class extends constructable {
    public constructor (...args: any[]) {
      const autowiredArguments = autowireArguments(arguments, autowirableConstructorParameters);

      super(...autowiredArguments);

      getAutowirableMembers(constructable)
        .forEach(({ name, type, constructorArgs }) => {
          this[name] = new type(...constructorArgs);
        });
    }
  };
}
