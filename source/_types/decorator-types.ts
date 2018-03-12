import { Extension } from './standard-types';

export type Decorator = ClassDecorator | MethodDecorator | PropertyDecorator | ParameterDecorator;
export type DecoratorFactory<D extends Decorator = Decorator> = (...args: any[]) => D;
export type DecoratorTarget = Function | Object;
