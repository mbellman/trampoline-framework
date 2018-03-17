# trampoline-framework
A TypeScript framework for making me feel great about having developed a framework.

## Usage
`import { ... } from 'trampoline-framework';`

## Decorators

#### @Bound
A class and class method decorator decorator which binds instance
methods to instance contexts. When applied to a class, all methods
are context-bound.

```typescript
@Bound class View {
  onButtonClick () { }
  onOptionClick () { }
  onLinkClick () { }
}
```

```typescript
class A {
  public prop: any;

  @Bound public assignProp (prop: any): void {
    this.prop = prop;
  }
}
```

#### @Final

A class and class method decorator which prevents extension and
subclass overrides, respectively.

```typescript
@Final class A { }

// Throws Error in strict mode
class B extends A { }

// Throws Error in non-strict mode
const b: B = new B();
```

```typescript
class A {
  @Final public method (): void { }
}

class B extends A {
  // Throws Error
  public method (): void { }
}
```

#### @Implements

A method decorator which merely labels a method as an implementation
for an interface or abstract class method. If a superclass already
implements the decorated method, an Error is thrown.

```typescript
class Service implements IFetchable {
  @Implements public fetch (): Promise<any> {
    // ...
  }
}
```

#### @Override
A method decorator which merely labels a method as an override
for a superclass method. If the superclass lacks the corresponding
method, an Error is thrown.

```typescript
class AppView extends View {
  @Override public onRender (): {
    // ...
  }
}
```

#### @Automated
A class decorator which enables methods to be decorated
with **@Run()** or **@Poll()**.

```typescript
@Automated class A { }
```

#### @Run()
A method decorator which runs decorated instance methods at class
instantiation, and decorated static methods at runtime. Arguments
can be provided to the decorator to call the targeting method with.
Decorated methods must be on an **@Automated** class.

```typescript
@Automated class A {
  @Run()
  public init (): void { }
}

@Automated class B {
  @Run(Date.now())
  public static init (time: number): void {
    // ...
  }
}
```

#### @Poll()
A method decorator which repeatedly runs decorated instance methods
at class instantiation, and decorated static methods at runtime. A
polling interval, measured in milliseconds, can be specified as the
decorator argument, which defaults to 1000. Decorated methods must
be on an **@Automated** class.

```typescript
@Automated class A {
  @Poll(500)
  public check (): void { }
}

@Automated class B {
  @Poll(100)
  public static check (): void { }
}
```

#### @Wired
A class decorator which enables all **@Autowired()** properties
or method parameters to be autowired at instantiation or when
the applicable method is called, respectively.

```typescript
@Wired class A { }
```

#### @Autowired
A property and parameter decorator which allows values to be autowired
(automatically provided with new instances) at class instantiation or
method call time. Classes which contain autowired properties or method
parameters must also be decorated with **@Wired**. Right now, autowiring
only works for instance properties or instance method parameters.  

Arguments can be provided to the decorator to be passed into autowired
instances on construction.

```typescript
@Wired class DAO {
  @Autowired() public service: Service;
}

@Wired class DAO2 {
  public fetch (@Autowired('route/to/api.svc') service?: Service): {
    return service.fetch();
  }
}
```

#### @PreventDefault
Prevents default event behavior for events passed into decorated
class method event handlers.

```typescript
class View {
  @PreventDefault
  public onClick (e: Event): void { }
}
```

#### @StopPropagation
Stops event propagation from decorated class method event handlers.

```typescript
class View {
  @StopPropagation
  public onClick (e: Event): void { }
}
```

#### @SuppressEvent
Composes **@StopPropagation** and **@PreventDefault** into a single decorator.

```typescript
class View {
  @SuppressEvent
  public onClick (e: Event): void { }
}
```

## Extensible classes

#### Singleton
A class which provides Singleton pattern behavior to extending
classes. Contention about Singletons aside, this at least saves
the trouble of implementing the pattern for every Singleton class.

```typescript
class A extends Singleton { }

// Throws Error
const a: A = new A();

const a: A = A.getInstance();
```

## Data structures

#### Map
```typescript
import { Map } from 'trampoline-framework';

const map = new Map<string, number>();

map.set('hello', 5)
map.get('hello') // 5
map.size // 1
map.entries() // [ [ 'hello', 5 ] ]
map.keys() // [ 'hello' ]
map.values() // [ 5 ]
map.has('hello') // true

map.forEach((value: number, key: string, map: Map<string, number>) => {
  // ...
})

map.delete('hello')

map.set('hi', 1)
map.set('bye', 2)

map.clear()
map.size() // 0
```

#### MultiMap
```typescript
import { MultiMap } from 'trampoline-framework';

const multiMap = new MultiMap<string, number>()

multiMap.put('hello', 1)
multiMap.put('hello', 2)
multiMap.put('hello', 3)
multiMap.size // 1
multiMap.has('hello') // true
multiMap.get('hello') // [ 1, 2, 3 ]

multiMap.forEach((values: number[], key: string, multiMap: MultiMap<string, number>) => {
  // ...
})

multiMap.remove('hello', 2)
multiMap.get('hello') // [ 1, 3 ]
multiMap.remove('hello')
multiMap.size() // 0

multiMap.put('hi', 1)
multiMap.put('hi', 2)
multiMap.put('bye', 3)
multiMap.put('bye', 4)
multiMap.clear()

multiMap.size() // 0
```