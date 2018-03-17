import { createDecorator } from '../internals/decorator-utils';
import { createMetadataStore } from '../internals/reflection-utils';
import { IConstructable } from '../types/standard-types';

/**
 * @internal
 */
interface IAutomatedMethod {
  methodName: string;
}

/**
 * @internal
 */
interface IRunnableMethod extends IAutomatedMethod {
  args: any[];
}

/**
 * @internal
 */
interface IPolledMethod extends IAutomatedMethod {
  interval: number;
}

/**
 * @internal
 */
const RUNNABLE_METHOD_KEY = Symbol('runnable');

/**
 * @internal
 */
const POLLED_METHOD_KEY = Symbol('polled');

/**
 * @internal
 */
const {
  get: getRunnableMethods,
  add: addRunnableMethod
} = createMetadataStore<IRunnableMethod>(RUNNABLE_METHOD_KEY);

/**
 * @internal
 */
const {
  get: getPolledMethods,
  add: addPolledMethod
} = createMetadataStore<IPolledMethod>(POLLED_METHOD_KEY);

/**
 * @internal
 */
function callRunnableMethods (
  context: any,
  runnableMethods: IRunnableMethod[]
): void {
  runnableMethods.forEach(({ methodName, args }) => {
    context[methodName](...args);
  });
}

/**
 * @internal
 */
function callPolledMethods (
  context: any,
  polledMethods: IPolledMethod[]
): void {
  polledMethods.forEach(({ methodName, interval }) => {
    setInterval(() => {
      context[methodName]();
    }, interval);
  });
}

/**
 * A class decorator which enables methods to be decorated
 * with @Run() or @Poll().
 *
 * ```
 * @Automated class A { }
 * ```
 */
export const Automated = createDecorator<ClassDecorator>({
  name: 'Automated',
  classDecorator: (target: Function) => {
    const { prototype } = target;
    const staticRunnableMethods = getRunnableMethods(target);
    const staticPolledMethods = getPolledMethods(target);
    const instanceRunnableMethods = getRunnableMethods(prototype);
    const instancePolledMethods = getPolledMethods(prototype);

    callRunnableMethods(target, staticRunnableMethods);
    callPolledMethods(target, staticPolledMethods);

    return class extends (target as IConstructable) {
      public constructor (...args: any[]) {
        super(...args);

        callRunnableMethods(this, instanceRunnableMethods);
        callPolledMethods(this, instancePolledMethods);
      }
    };
  }
});

/**
 * A method decorator which runs decorated instance methods at class
 * instantiation, and decorated static methods at runtime. Arguments
 * can be provided to the decorator to call the targeting method with.
 * Decorated methods must be on an @Automated class.
 *
 * ```
 * @Automated class A {
 *   @Run()
 *   public init (): void { }
 * }
 *
 * @Automated class B {
 *   @Run(Date.now())
 *   public static init (time: number): void {
 *     // ...
 *   }
 * }
 * ```
 */
export function Run (
  ...args: any[]
) {
  return createDecorator<MethodDecorator>({
    name: 'Run',
    methodDecorator: (target: Object, propertyKey: string | symbol) => {
      addRunnableMethod(target, {
        methodName: propertyKey as string,
        args
      });
    }
  });
}

/**
 * A method decorator which repeatedly runs decorated instance methods
 * at class instantiation, and decorated static methods at runtime. A
 * polling interval, measured in milliseconds, can be specified as the
 * decorator argument, which defaults to 1000. Decorated methods must
 * be on an @Automated class.
 *
 * ```
 * @Automated class A {
 *   @Poll(500)
 *   public check (): void { }
 * }
 *
 * @Automated class B {
 *   @Poll(100)
 *   public static check (): void { }
 * }
 * ```
 */
export function Poll (
  interval: number = 1000
) {
  return createDecorator<MethodDecorator>({
    name: 'Poll',
    methodDecorator: (target: Function, propertyKey: string | symbol) => {
      addPolledMethod(target, {
        methodName: propertyKey as string,
        interval
      });
    }
  });
}
