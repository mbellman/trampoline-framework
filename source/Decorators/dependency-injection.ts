import { createNormalizedDecorator } from '../Internals/decorator-helpers';
import { DecoratorTarget } from '../Types/decorator-types';
import { getAutowirableMembers, getAutowirableParameters, IAutowirableParameter, saveAutowirableMember, saveAutowirableParameter } from '../Internals/dependency-injection-helpers';
import { getReflectedMethodParameterTypes, getReflectedPropertyType } from '../Internals/reflection-helpers';
import { IConstructable } from '../Types/standard-types';
import { toArray } from '../Utils/array-utils';

const CONSTRUCTOR_METHOD_ID = '__constructor__';

function autowireArguments (
  args: IArguments,
  autowirableParameters: IAutowirableParameter[]
): any[] {
  const autowiredArgs = toArray(args);

  autowirableParameters.forEach(({ parameterIndex, type, constructorArgs }) => {
    autowiredArgs[parameterIndex] = new type(...constructorArgs);
  });

  return autowiredArgs;
}

function createWiredMethod (
  originalMethod: Function,
  methodAutowirableParameters: IAutowirableParameter[]
): Function {
  return function () {
    const autowiredArguments = autowireArguments(arguments, methodAutowirableParameters);

    originalMethod.apply(this, autowiredArguments);
  };
}

function enableAutowirableParameterChecking (
  target: Function
): void {
  const { prototype } = target;
  const allAutowirableParameters = getAutowirableParameters(target);

  Object.keys(prototype)
    .forEach(targetMethodName => {
      const methodAutowirableParameters = allAutowirableParameters
        .filter(({ methodName }) => methodName === targetMethodName);

      if (methodAutowirableParameters.length > 0) {
        const originalMethod = prototype[targetMethodName];

        prototype[targetMethodName] = createWiredMethod(originalMethod, methodAutowirableParameters);
      }
    });
}

export function Autowired (
  ...constructorArgs: any[]
): PropertyDecorator & ParameterDecorator {
  return createNormalizedDecorator(
    (target: DecoratorTarget, propertyKey: string | symbol, parameterIndex?: number) => {
      const { prototype } = target as Function;

      if (typeof parameterIndex === 'number') {
        // Parameter decorator
        const isConstructorParameter = !propertyKey;
        const reflectTarget = isConstructorParameter ? target : prototype;
        const parameterTypes: IConstructable[] = getReflectedMethodParameterTypes(reflectTarget, propertyKey);
        const methodName = isConstructorParameter ? CONSTRUCTOR_METHOD_ID : propertyKey as string;

        saveAutowirableParameter(target, {
          type: parameterTypes[parameterIndex],
          constructorArgs,
          methodName,
          parameterIndex
        });
      } else {
        // Property decorator
        const type: IConstructable = getReflectedPropertyType(prototype, propertyKey);

        saveAutowirableMember(target, {
          type,
          constructorArgs,
          memberName: propertyKey as string
        });
      }
    }
  ) as PropertyDecorator & ParameterDecorator;
}

export const Wired = createNormalizedDecorator(
  (target: DecoratorTarget): IConstructable => {
    enableAutowirableParameterChecking(target as Function);

    const autowirableConstructorParameters = getAutowirableParameters(target)
      .filter(({ methodName }) => methodName === CONSTRUCTOR_METHOD_ID);

    return class extends (target as IConstructable) {
      public constructor (...args: any[]) {
        const autowiredArguments = autowireArguments(arguments, autowirableConstructorParameters);

        super(...autowiredArguments);

        getAutowirableMembers(target)
          .forEach(({ memberName, type, constructorArgs }) => {
            this[memberName] = new type(...constructorArgs);
          });
      }
    };
  }
) as ClassDecorator;
