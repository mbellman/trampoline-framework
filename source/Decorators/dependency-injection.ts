import { createNormalizedDecorator } from '../Internals/decorator-helpers';
import { DecoratorFactory, DecoratorTarget } from '../Types/decorator-types';
import { getAutowirableMembers, getAutowirableParameters, IAutowirableParameter, saveAutowirableMember, saveAutowirableParameter } from '../Internals/dependency-injection-helpers';
import { getReflectedMethodParameterTypes, getReflectedPropertyType } from '../Internals/reflection-helpers';
import { IConstructable } from '../Types/standard-types';
import { toArray } from '../Utils/array-utils';

const CONSTRUCTOR_METHOD_ID = '__constructor__';

/**
 * Returns an array of arguments with autowired values. The provided
 * {autowirableParameters} array determines which argument indices
 * need autowiring, as well as the constructable type and constructor
 * arguments to use.
 */
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

/**
 * Returns a wrapper method for {originalMethod} which autowires
 * arguments whenever the method is called and passes the autowired
 * arguments array along to {originalMethod}.
 */
function createWiredMethod (
  originalMethod: Function,
  autowirableParameters: IAutowirableParameter[]
): Function {
  return function () {
    const autowiredArguments = autowireArguments(arguments, autowirableParameters);

    originalMethod.apply(this, autowiredArguments);
  };
}

/**
 * Loops over each method on a target constructor function's
 * prototype and, based on the autowirable parameters metadata
 * saved via @Autowired() parameter decorators, wraps the
 * prototype's methods where autowiring will need to occur.
 * Only methods with corresponding autowired parameters will
 * be wrapped, and createWiredMethod() will be used to create
 * the wrapper methods.
 */
function enableAutowirableParameterChecks (
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

/**
 * A property and parameter decorator which saves autowiring metadata
 * to a class. Arguments can be passed to the decorator to be passed
 * into the autowired instance at construction. All classes which
 * utilize autowiring must also be decorated with @Wired.
 *
 * ```
 * @Wired class Consumer {
 *   @Autowired() public service: Service;
 * }
 *
 * @Wired class Consumer2 {
 *   public fetch (@Autowired() service?: Service): {
 *     return service.fetch();
 *   }
 * }
 * ```
 */
export const Autowired: DecoratorFactory<PropertyDecorator & ParameterDecorator> = (
  ...constructorArgs: any[]
) => {
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
};

/**
 * A class decorator which enables all @Autowired() properties
 * or method parameters to be autowired.
 */
export const Wired = createNormalizedDecorator(
  (target: DecoratorTarget): IConstructable => {
    enableAutowirableParameterChecks(target as Function);

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
