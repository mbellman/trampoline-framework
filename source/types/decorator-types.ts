export type Decorator = ClassDecorator | MethodDecorator | PropertyDecorator | ParameterDecorator;
export type DecoratorTarget = Function & Object;

export type DecoratorFactory<D extends Decorator = Decorator> = (
  ...args: any[]
) => D;

export type NormalizedClassDecorator = (
  target: DecoratorTarget,
  propertyKey?: string | symbol,
  arg3?: PropertyDescriptor | number
) => any;

export type NormalizedMethodDecorator = (
  target: DecoratorTarget,
  propertyKey: string | symbol,
  propertyDescriptor: PropertyDescriptor
) => any;

export type NormalizedPropertyDecorator = (
  target: DecoratorTarget,
  propertyKey: string | symbol
) => any;

export type NormalizedParameterDecorator = (
  target: DecoratorTarget,
  propertyKey: string | symbol,
  parameterIndex: number
) => any;

export type NormalizedDecorator = NormalizedClassDecorator | NormalizedMethodDecorator | NormalizedPropertyDecorator | NormalizedParameterDecorator;