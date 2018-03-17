import { Constructor, Extension, IConstructable, Method } from '../types/standard-types';
import { createMetadataStore, getReflectedMethodParameterTypes, getReflectedPropertyType } from '../internals/reflection-utils';
import { createNormalizedDecorator } from '../internals/decorator-utils';
import { DecoratorFactory, DecoratorTarget } from '../types/decorator-types';
import { forMethodsOnObject } from '../internals/object-utils';
import { hasValue } from '../internals/type-utils';
import { toArray, partition } from '../internals/array-utils';

/**
 * @internal
 */
enum MemberSide {
  INSTANCE,
  STATIC
}

/**
 * @internal
 */
interface IAutowirable {
  type: IConstructable;
  constructorArgs: any[];
}

/**
 * @internal
 */
interface IAutowirableProperty extends IAutowirable {
  propertyName: string;
  side: MemberSide;
}

/**
 * @internal
 */
interface IAutowirableParameter extends IAutowirable {
  methodName: string;
  parameterIndex: number;
}

/**
 * A special ID to refer to the constructor method when saving autowirable
 * method parameter metadata. Since the constructor propertyKey is undefined,
 * we supply this value instead.
 *
 * @internal
 */
const CONSTRUCTOR_METHOD_ID = '__constructor__';

/**
 * @internal
 */
const AUTOWIRABLE_PROPERTIES_KEY = Symbol('autowirable-properties');

/**
 * @internal
 */
const AUTOWIRABLE_PARAMETERS_KEY = Symbol('autowirable-parameters');

/**
 * @internal
 */
const {
  get: getAutowirableProperties,
  add: addAutowirableProperty
} = createMetadataStore<IAutowirableProperty>(AUTOWIRABLE_PROPERTIES_KEY);

/**
 * @internal
 */
const {
  get: getAutowirableParameters,
  add: addAutowirableParameter
} = createMetadataStore<IAutowirableParameter>(AUTOWIRABLE_PARAMETERS_KEY);

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
 * Loops over each all of a target's instance-side and static-side
 * methods and wires all which receive @Autowired() parameters.
 *
 * @internal
 */
function bindWiredMethods (
  target: Function
): void {
  const { prototype } = target;
  const allAutowirableParameters = getAutowirableParameters(target);

  const wireMethod = (method: Function, autowiredMethodName: string, wireTarget: any) => {
    const methodAutowirableParameters = allAutowirableParameters
      .filter(({ methodName }) => methodName === autowiredMethodName);

    if (methodAutowirableParameters.length > 0) {
      wireTarget[autowiredMethodName] = createWiredMethod(method, methodAutowirableParameters);
    }
  };

  forMethodsOnObject(target, wireMethod);
  forMethodsOnObject(prototype, wireMethod);
}

/**
 * @internal
 */
function autowireProperties (
  target: any,
  autowirableProperties: IAutowirableProperty[]
): void {
  autowirableProperties
    .forEach(({ propertyName, type, constructorArgs }) => {
      target[propertyName] = new type(...constructorArgs);
    });
}

/**
 * A property and parameter decorator which allows values to be autowired
 * (automatically provided with new instances) at class instantiation or
 * method call time. Classes which contain autowired properties or method
 * parameters must also be decorated with @Wired. Right now, autowiring
 * only works for instance properties or instance method parameters.
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
) {
  return createNormalizedDecorator<PropertyDecorator & ParameterDecorator>({
    name: 'Autowired',
    propertyDecorator: (target: Function, propertyKey: string | symbol) => {
      const { prototype } = target;

      // We can't reliably determine whether a property is instance-side
      // or static-side before it's been set (for example, for declared
      // properties), so we just have to try looking up type metadata on
      // both {prototype} and {target}
      const instancePropertyType = getReflectedPropertyType(prototype, propertyKey);
      const staticPropertyType = getReflectedPropertyType(target, propertyKey);
      const type: IConstructable = instancePropertyType || staticPropertyType;
      const side = instancePropertyType ? MemberSide.INSTANCE : MemberSide.STATIC;

      if (!type) {
        throw new Error(`Invalid @Autowired() type for property '${propertyKey}' on class '${target.name}'!`);
      }

      addAutowirableProperty(target, {
        type,
        constructorArgs,
        propertyName: propertyKey as string,
        side
      });
    },
    parameterDecorator: (target: Function, propertyKey: string | symbol, parameterIndex: number) => {
      const isConstructorParameter = !hasValue(propertyKey);
      const isForStaticMethod = !!(target as any)[propertyKey];
      const reflectTarget = isConstructorParameter || isForStaticMethod ? target : target.prototype;
      const parameterTypes: IConstructable[] = getReflectedMethodParameterTypes(reflectTarget, propertyKey);
      const methodName = isConstructorParameter ? CONSTRUCTOR_METHOD_ID : propertyKey as string;

      addAutowirableParameter(target, {
        type: parameterTypes[parameterIndex],
        constructorArgs,
        methodName,
        parameterIndex
      });
    }
  });
}

/**
 * A class decorator which enables all @Autowired() properties
 * or method parameters to be autowired at instantiation or when
 * the applicable method is called, respectively.
 *
 * ```
 * @Wired class A { }
 * ```
 */
export const Wired = createNormalizedDecorator<ClassDecorator>({
  name: 'Wired',
  classDecorator: (target: Function): IConstructable => {
    const autowirableProperties = getAutowirableProperties(target);

    const [
      autowirableStaticProperties,
      autowirableInstanceProperties
    ] = partition(autowirableProperties, (({ side }) => side === MemberSide.STATIC));

    const autowirableConstructorParameters = getAutowirableParameters(target)
      .filter(({ methodName }) => methodName === CONSTRUCTOR_METHOD_ID);

    bindWiredMethods(target);
    autowireProperties(target, autowirableStaticProperties);

    return class WiredClass extends (target as IConstructable) {
      public constructor (...args: any[]) {
        const autowiredArgs = autowireArguments(arguments, autowirableConstructorParameters);

        super(...autowiredArgs);

        autowireProperties(this, autowirableInstanceProperties);
      }
    };
  }
});
