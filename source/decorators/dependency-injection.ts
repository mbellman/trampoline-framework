import { Constructor, Extension, IConstructable, Method } from '../types/standard-types';
import { createNormalizedDecorator } from '../internals/decorator-utils';
import { DecoratorFactory, DecoratorTarget } from '../types/decorator-types';
import { forMethodsOnObject } from '../internals/object-utils';
import { getAutowirableMembers, getAutowirableParameters, IAutowirableParameter, saveAutowirableMember, saveAutowirableParameter } from '../internals/dependency-injection-utils';
import { getReflectedMethodParameterTypes, getReflectedPropertyType } from '../internals/reflection-utils';
import { toArray } from '../internals/array-utils';

/**
 * A special ID to refer to the constructor method when saving autowirable
 * method parameter metadata. Since the constructor propertyKey is undefined,
 * we supply this value instead.
 *
 * @internal
 */
const CONSTRUCTOR_METHOD_ID = '__constructor__';

/**
 * Returns an array of arguments with autowired values. The provided
 * {autowirableParameters} array determines which argument indices
 * need autowiring, as well as the constructable type and constructor
 * arguments to use.
 *
 * @internal
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
 *
 * @internal
 */
function createWiredMethod (
  originalMethod: Function,
  autowirableParameters: IAutowirableParameter[]
): Function {
  return function () {
    const autowiredArgs = autowireArguments(arguments, autowirableParameters);

    originalMethod.apply(this, autowiredArgs);
  };
}

/**
 * Loops over each method on a target constructor function's
 * prototype and overrides those with @Autowired() parameters
 * using createWiredMethod().
 *
 * @internal
 */
function enableAutowirableParameterChecks (
  target: Function
): void {
  const { prototype } = target;
  const allAutowirableParameters = getAutowirableParameters(target);

  forMethodsOnObject(prototype, (method, targetMethodName) => {
    const methodAutowirableParameters = allAutowirableParameters
      .filter(({ methodName }) => methodName === targetMethodName);

    if (methodAutowirableParameters.length > 0) {
      prototype[targetMethodName] = createWiredMethod(method, methodAutowirableParameters);
    }
  });
}

/**
 * A property and parameter decorator which allows values to be autowired
 * (automatically provided with new instances) at class instantiation or
 * method call time. Classes which contain autowired properties or method
 * parameters must also be decorated with @Wired.
 *
 * Arguments can be provided to the decorator to be passed into autowired
 * instances on construction.
 *
 * ```
 * @Wired class DAO {
 *   @Autowired() public service: Service;
 * }
 *
 * @Wired class DAO2 {
 *   public fetch (@Autowired('route/to/api.svc') service?: Service): {
 *     return service.fetch();
 *   }
 * }
 * ```
 */
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
  );
}

/**
 * A class decorator which enables all @Autowired() properties
 * or method parameters to be autowired at instantiation.
 *
 * ```
 * @Wired class A {
 * }
 * ```
 */
export const Wired = createNormalizedDecorator<ClassDecorator>(
  (target: DecoratorTarget): IConstructable => {
    enableAutowirableParameterChecks(target as Function);

    const autowirableConstructorParameters = getAutowirableParameters(target)
      .filter(({ methodName }) => methodName === CONSTRUCTOR_METHOD_ID);

    return class extends (target as IConstructable) {
      public constructor (...args: any[]) {
        const autowiredArgs = autowireArguments(arguments, autowirableConstructorParameters);

        super(...autowiredArgs);

        getAutowirableMembers(target)
          .forEach(({ memberName, type, constructorArgs }) => {
            this[memberName] = new type(...constructorArgs);
          });
      }
    };
  }
);
