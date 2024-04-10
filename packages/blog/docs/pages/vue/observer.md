### Observer

#### 数据侦测

核心 API ： Object.defineProperty ， 详见 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

该 API 提供最基础的数据拦截功能，也是 vue 框架的灵感来源。

```javascript
const obj = {};
let name = 'Tommy';

Object.defineProperty(obj, 'name', {
  set(newVal) {
    console.log(`赋值 name 为 ${newVal}`);
    name = newVal;
  },
  get() {
    console.log(`取值 name 为 ${name}`);
    return name;
  },
});
obj.name; //取值 name 为 Tommy
obj.name = 'Jack'; //赋值 name 为 Jack
name; //Jack
```

从示例中可以看出 `obj.name` 的取值和赋值完全是取自外部变量 `name`

#### 发布订阅

在实际应用中并非所有的字段都需要响应式绑定，也存在一个对象被多个功能模块所依赖的状况。

vue 采用发布订阅的设计模式，在 `defineProperty` 的 `get` 中收集依赖，而在 `set` 中通知数值更新，从而触发相应依赖的响应。
在此模式中有 `Dep` (订阅器) 和 `Watcher` (监听器) 两个重要概念， 其原理的简易实现下：

```js
// observe 对参数 obj 开启响应式的接口函数
function observe(obj) {
  // defineReactive 对 obj 添加一个响应式属性
  Object.keys(obj).forEach(function defineReactive(key) {
    // 每一个响应式属性皆有一个订阅器
    const dep = new Dep();
    let internalVal = obj[key];
    Object.defineProperty(obj, key, {
      set(newVal) {
        const isChange = newVal !== internalVal;
        if (isChange) {
          internalVal = newVal;
          dep.notify(); //发送通知
        }
      },
      get() {
        dep.depend(); //添加依赖
        return internalVal;
      },
    });
  });
}

let activeUpdate;
class Dep {
  constructor() {
    this.subScribers = new Set();
  }
  depend() {
    if (activeUpdate) {
      this.subScribers.add(activeUpdate); //添加依赖
    }
  }
  notify() {
    this.subScribers.forEach((subscriber) => subscriber()); //接收通知触发依赖响应
  }
}
//  atuorun 为外部触发依赖的接口函数
function atuorun(update) {
  //watch 封装 update
  function watch() {
    activeUpdate = watch;
    update();
    activeUpdate = null;
  }
  watch();
}

const obj = {
  a: 1,
  b: 2,
  c: 3,
};
observe(obj);

const cb1 = function() {
  const val = obj.a;
  console.log(`当前 a 的值为 ${val}`);
};
const cb2 = function() {
  const val = obj.b;
  console.log(`当前 b 的值为 ${val}`);
};
atuorun(cb1);
atuorun(cb2);

obj.a = 10; //'当前 a 的值为 10'
obj.b = 20; //'当前 b 的值为 20'
obj.c = 30; //没有依赖注入，遂没有输出内容
```

#### observe
`observe` 函数为响应式的入口，当 `vm` 实例初始化的 `initState` (`src/core/instance/state.js`) 中执行调用



`src/core/observer/index.js`

```js
export function observe(value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return;
  }v
  let ob: Observer | void;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob;
}
```

1. `observe` 函数为目标对象创建响应式对象，若存在标识 `__ob__` 则说明该对象已存在响应式直接取值
2. `observe` 的第二个参数为是否是 `vm` 实例的 `rootData`，若是则 `vmCount` + 1
3. 从源码中可看出该对象可响应式的条件为：

- `isObject(value)` -- 数据类型属于 `object`
- `value instanceof VNode` -- 不可为 `VNode` 类型
- `shouldObserve` -- 程序的一些特殊情况将其标记为 `false`
- `!isServerRendering()` -- 非服务端渲染
- `Array.isArray(value) || isPlainObject(value)` -- 数据类型只能为数组和普通的 `Object` ，其余内置对象生成的数据并不能实现响应式，其中就包括原生的 `Set` 和 `Map`
- `Object.isExtensible(value)` --可扩展的对象，比如 `Object.preventExtensions`，`Object.seal` 或 `Object.freeze` 可将对象变为不可扩展
- `!value._isVue` -- 非 `vm` 实例 (`vm` 实例初始化时会将其标记为 `true` )

#### Observer

`src/core/observer/index.js`

```js
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that have this object as root $data
  constructor(value: any) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;
    def(value, '__ob__', this);
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods);
      } else {
        copyAugment(value, arrayMethods, arrayKeys);
      }
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }
  walk(obj: Object) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }
  observeArray(items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  }
}
```

1.  `Observer` 为对象监听的封装类，它与 `Dep` 是一对一的存在关系。
2.  `Observer` 为对象标记 `__ob__` 指向自身
3.  根据对象数据类型为数组或对象，响应式方式分开处理

#### Dep
`src/core/observer/dep.js`
```js
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;
  constructor () {
    this.id = uid++
    this.subs = []
  }
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
const targetStack = []

export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
```
PS：通过 `targetStack` 的 `push`和 `pop` 来确保同一时间只操作一个 `watcher`


#### 拦截数组方法

`src/core/observer/array.js`

```js
const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto);

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
];

methodsToPatch.forEach(function(method) {
  // cache original method
  const original = arrayProto[method];
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args);
    const ob = this.__ob__;
    let inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted) ob.observeArray(inserted);
    // notify change
    ob.dep.notify();
    return result;
  });
});
```

1. `array[idx] = val` 的赋值方式在 vue 中不对其进行响应
2. 通过拦截原生数组的 7 种操作函数实现了对数组增删改操后数据的响应式

#### defineReactive

`src/core/observer/index.js`

```js
export function defineReactive(
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep();

  const property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }

  // cater for pre-defined getter/setters  ①
  const getter = property && property.get;
  const setter = property && property.set;
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key];
  }

  let childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val;    //①
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return;
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter();
      }
      if (getter && !setter) return;            //①
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = !shallow && observe(newVal);
      dep.notify();
    },
  });
}
```
1. `defineReactive` 为对象增加响应式属性，依赖收集和更新通知实际上在该函数上实现
2. 每个响应式属性存在一个 `Dep` 与之对应。而 `Dep` 与 `Watcher` 是多对对的存在关系
3. 代码注释①部分为对象预先定义好 `getter` 与 `setter` 各种边界情况的特殊处理
4. `customSetter` 为测试环境中预定义的警告函数
5. `shallow` 为是否不对深层对象数据做响应式的标识
6. 当 `shallow` 不为 `true`(或者其他 '真' 值) 时，会继续对其属性值进行响应式处理，此算法过程为一个递归操作
7. 内层数据的响应式监听对象 `Observer` 的 `Dep` 都会收集上层数据的 `Watcher` 依赖