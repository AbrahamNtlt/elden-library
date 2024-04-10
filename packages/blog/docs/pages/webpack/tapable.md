### tapable

what: webpack 事件流机制的核心库。<br>
why : 方便 webpack 运行的各生命周期中扩展功能。<br>
how : 核心原理依赖于发布订阅模式，类似于 nodejs 的 events 库。<br>

#### 基础使用

```js
const { SyncHook } = require('tapable'); //①

const hook = new SyncHook(['name']); //②
hook.tap('register', (name) => {
  //③
  console.log('has register ' + name);
});
hook.tap('register2', (data) => {
  //④
  console.log('has register2 ' + data);
});

hook.call('event'); //⑤

// has register event
// has register2 event
```

1. tapable 库导出的是各种钩子的集合
2. 创建钩子实例的时候传参必须为数组,数组内元素为注册函数的形参
3. hook 分别有注册和响应的函数
4. 注册的第一个参数名为了方便代码阅读和维护,对实际运行没有影响
5. 响应函数的参数,作为注册函数的实参运行

#### Hook 的种类

```js
const {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
  AsyncParallelHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesLoopHook,
  AsyncSeriesWaterfallHook,
} = require('tapable');
```

Hook 最主要可分为同步和异步钩子两大类，异步钩子还可细分为串行和并行两类。

1.  同步:

    - SyncHook ：<br>
      是所有 hook 中最普通、功能最纯粹的，每个注册的函数都将按照注册的顺序执行。<br>
      所有执行函数参数相同。<br>
      call 函数无返回值。<br>
    - SyncBailHook ：<br>
      带 Bail 的 hook 的特点是允许注册的函数停止后续函数的执行。

      ```js
      const hook = new SyncBailHook(['name']);
      hook.tap('ev1', function(name) {
        console.log('ev1 ' + name);
        return '不往下执行了';
      });
      hook.tap('ev2', function(name) {
        console.log('ev2 ' + name);
      });
      hook.call('call'); //返回值为 '不往下执行了'

      //ev1 call
      ```

      当前函数的返回值不为 `undefined` 则会阻止后续函数的执行。<br>
      所有执行函数参数相同。<br>
      call 函数返回值为最后一个执行函数的返回值。<br>

    - SyncWaterfallHook ：<br>
      带 Waterfall 的 hook 的特点是当前执行函数的返回值作为下一个函数执行的第一个参数。

      ```js
      const hook = new SyncWaterfallHook(['name', 'data']);
      hook.tap('ev1', function(name, data) {
        console.log('ev1', name, data);
        return 'ev1 的返回值';
      });
      hook.tap('ev2', function(name, data) {
        console.log('ev2', name, data);
      });
      hook.call('call', 'other'); // 返回值为 'ev1 的返回值'
      // ev1 call other
      // ev2 ev1 的返回值 other
      ```

      所有注册函数依旧按照注册顺序执行。<br>
      执行函数的参数数量相同，但第一个参数可能是上一个函数的返回值。<br>
      call 函数返回的是最后一个有返回值函数的返回值。<br>

    - SyncLoopHook ：<br>
      带 Loop 的 hook 的特点是当前执行函数返回值不为 `undefined` 时,当前函数将循环执行。

      ```js
      const hook = new SyncLoopHook(['name']);
      let idx = 0;
      hook.tap('ev1', function(name) {
        console.log('ev1', name);
        idx++;
        return idx === 3 ? undefined : '再来一次';
      });
      hook.tap('ev2', function(name) {
        console.log('ev2', name);
      });
      hook.call('call');
      //ev1 call
      //ev1 call
      //ev1 call
      //ev2 call
      ```

      所有执行函数参数相同。<br>
      call 函数无返回值。<br>
      该 hook 并没有在 webpack 核心库使用，可根据业务需求做插件扩展。<br>

2.  异步 ：<br>
    带 Async 的 hook 的均为异步钩子。<br>
    异步钩子增加了两种注册和执行函数。(异步钩子也可以使用同步注册和执行)<br>
    `tapAsync` 注册的函数通过 `callAsync` 执行。<br>
    `tapAsync` 注册的函数的参数最后增加一个回调函数,该回调函数的执行用来通知 hook 当前函数执行结束。
    当 `tapAsync` 参数不为 `undefined`/`null` 时,视为出现异常， `callAsync`的回调函数会将次异常作为参数立即执行,往后其余注册函数的回调将不影响最终回调函数的执行。
    `callAsync` 的最后一个参数也增加一个回调函数，当所有注册函数的回调执行完成后，该回调函数最后执行。

    ```js
    hook.tapAsync('async', function(name, cb) {
      setTimeout(function() {
        cb();
      }, 10);
    });
    hook.callAsync('jw', function() {
      console.log('end');
    });
    ```

    `tapPromise` 注册的函数通过 `promise` 执行。<br>
    `tapPromise` 注册的函数相当于 一个 Promise 对象。<br>
    `promise` 执行函数的效果相当于 Promise.all 的执行。<br>
    关于注册函数出现 reject 的情况根据 与相同 hook 的 `tapAsync` 出现异常情况相同。<br>

    ```js
    hook.tapPromise('promise', function(name) {
      return new Promise((res, rej) => {
        setTimeout(() => {
          console.log('promise', name);
          res();
        }, 200);
      });
    });
    hook.promise('promiseArgs').then(() => {
      console.log('promise done');
    });
    ```

    - AsyncParallelHook ：<br>
      带 Parallel 的 hook 的均为异步并行钩子,其特点是各个注册函数之间的执行互不影响。<br>

      ```js
      const hook = new AsyncParallelHook(['name']);
      hook.tapAsync('react', function(name, cb) {
        setTimeout(function() {
          console.log('react', name);
          cb('finish right now');
        }, 500);
      });
      hook.tapAsync('node', function(name, cb) {
        setTimeout(function() {
          console.log('node', name);
          cb();
        }, 500);
      });
      hook.callAsync('jw', function() {
        console.log('end');
      });
      //react jw
      //end
      //node jw
      ```

      此处演示 `tapAsync` 回调执行异常的情况。
      即便出现异常也不影响后置函数的执行。

    - AsyncParallelBailHook ：<br>
      与 AsyncParallelHook 区别在于:
      AsyncParallelHook 的 `callAsync` 的回调函数的异常参数为第一个执行时出现异常的函数。<br>
      AsyncParallelBailHook 的 `callAsync` 的回调函数的异常参数为出现异常的函数中注册顺序最靠前的函数。<br>

    - AsyncSeriesHook ：<br>
      带 Series 的 hook 的均为异步串行钩子,其特点是前置注册函数执行完成之后,后置的注册函数才开始执行。<br>
      当执行回调出现异常时,将阻断后置函数的执行,异常作为`callAsync` 的参数执行。<br>

      ```js
      const hook = new AsyncSeriesHook(['name']);
      hook.tapAsync('ev1', function(name, cb) {
        setTimeout(function() {
          console.log('ev1', name);
          cb('error');
        }, 1500);
      });
      hook.tapAsync('ev2', function(name, cb) {
        setTimeout(function() {
          console.log('ev2', name);
        }, 1000);
      });

      hook.callAsync('call', function(err) {
        console.log('finish', err);
      });
      //ev1 call
      //finish error
      ```

    - AsyncSeriesBailHook / AsyncSeriesWaterfallHook / AsyncSeriesLoopHook ：结合以上关键字的特性可得特性。 <br>

总结:

| 关键字                | 含义                                                               |
| --------------------- | ------------------------------------------------------------------ |
| Sync                  | 同步钩子，注册函数按注册顺序同步执行                               |
| tap/call              | 同步注册 /执行                                                     |
| Async                 | 异步钩子，支持异步执行的注册函数                                   |
| tapAsync/callAsync    | 异步，通过回调函数通知钩子执行结束，回调函数有传参视为抛出异常处理 |
| tapPromise/promise    | 异步，按照 Promise 的规则运行                                      |
| Parallel              | 异步并行，注册函数并行执行                                         |
| Series                | 异步串行，注册函数串行执行                                         |
| Bail                  | 保险钩子，前置注册函数的有返回值时，后置注册函数将不执行           |
| Waterfall             | 瀑布流钩子，前置注册函数的返回值将作为后置函数的参数               |
| Loop                  | 循环钩子，当注册函数有返回值时，将会再次执行                       |
| AsyncParallelBailHook | 相对特殊，注册函数异步并行互不影响，但影响最终回调函数的执行参数   |

#### 源码分析

PS: webpack 中的 tapable 源码不在 master 上 ，需要切到分支 tapable-1 。

```js
exports.__esModule = true;
exports.Tapable = require('./Tapable');
exports.SyncHook = require('./SyncHook');
exports.SyncBailHook = require('./SyncBailHook');
exports.SyncWaterfallHook = require('./SyncWaterfallHook');
exports.SyncLoopHook = require('./SyncLoopHook');
exports.AsyncParallelHook = require('./AsyncParallelHook');
exports.AsyncParallelBailHook = require('./AsyncParallelBailHook');
exports.AsyncSeriesHook = require('./AsyncSeriesHook');
exports.AsyncSeriesBailHook = require('./AsyncSeriesBailHook');
exports.AsyncSeriesWaterfallHook = require('./AsyncSeriesWaterfallHook');
exports.HookMap = require('./HookMap');
exports.MultiHook = require('./MultiHook');
```

从入口文件可知, 引入的 tapable (index.js) 主要就是复杂导出各种钩子。<br/>

```js
const Hook = require('./Hook');
const HookCodeFactory = require('./HookCodeFactory');
class SyncHookCodeFactory extends HookCodeFactory {
  content({ onError, onDone, rethrowIfPossible }) {
    return this.callTapsSeries({
      onError: (i, err) => onError(err),
      onDone,
      rethrowIfPossible,
    });
  }
}
const factory = new SyncHookCodeFactory();
class SyncHook extends Hook {
  tapAsync() {
    throw new Error('tapAsync is not supported on a SyncHook');
  }
  tapPromise() {
    throw new Error('tapPromise is not supported on a SyncHook');
  }
  compile(options) {
    factory.setup(this, options);
    return factory.create(options);
  }
}
module.exports = SyncHook;
```

```js
const Hook = require('./Hook');
const HookCodeFactory = require('./HookCodeFactory');
class AsyncSeriesLoopHookCodeFactory extends HookCodeFactory {
  content({ onError, onDone }) {
    return this.callTapsLooping({
      onError: (i, err, next, doneBreak) => onError(err) + doneBreak(true),
      onDone,
    });
  }
}
const factory = new AsyncSeriesLoopHookCodeFactory();
class AsyncSeriesLoopHook extends Hook {
  compile(options) {
    factory.setup(this, options);
    return factory.create(options);
  }
}
Object.defineProperties(AsyncSeriesLoopHook.prototype, {
  _call: { value: undefined, configurable: true, writable: true },
});
module.exports = AsyncSeriesLoopHook;
```

每个钩子的结构大致如上,共同点:

1. 当前钩子继承于 Hook 类。
2. 通过重写 `content` 的实现,改变当前钩子的 `compile` 方法。
3. 同步钩子重写 tapAsync/tapPromise 阻止执行。
4. 异步钩子在其原型上添加(重写覆盖)了 `_call`属性。

解析一下 Hook 类的内部:

```js
class Hook {
  constructor(args) {
    if (!Array.isArray(args)) args = [];
    this._args = args;
    this.taps = [];
    this.interceptors = [];
    this.call = this._call;
    this.promise = this._promise;
    this.callAsync = this._callAsync;
    this._x = undefined;
  }
  compile(options) {
    throw new Error('Abstract: should be overriden');
  }
  _createCall(type) {
    return this.compile({
      taps: this.taps,
      interceptors: this.interceptors,
      args: this._args,
      type: type,
    });
  }
  tap(options, fn) {
    // .... 略去非核心代码
    options = Object.assign({ type: 'sync', fn: fn }, options);
    this._insert(options);
  }
  tapAsync(options, fn) {
    // ....略去非核心代码 , 与 tap 方法区别就是一个类型的传参
    options = Object.assign({ type: 'async', fn: fn }, options);
    this._insert(options);
  }
  tapPromise(options, fn) {
    // ....略去非核心代码 , 与 tap 方法区别就是一个类型的传参
    options = Object.assign({ type: 'async', fn: fn }, options);
    this._insert(options);
  }

  _resetCompilation() {
    this.call = this._call;
    this.callAsync = this._callAsync;
    this.promise = this._promise;
  }

  _insert(item) {
    // ....略去非核心代码, 将注册事件与函数添加到 taps中
    this.taps[i] = item;
  }
  // ....略去 hook 类中 拦截器相关方法
}

function createCompileDelegate(name, type) {
  return function lazyCompileHook(...args) {
    this[name] = this._createCall(type);
    return this[name](...args);
  };
}

Object.defineProperties(Hook.prototype, {
  _call: {
    value: createCompileDelegate('call', 'sync'),
    //略去非核心代码....
  },
  _promise: {
    value: createCompileDelegate('promise', 'promise'),
    //略去非核心代码....
  },
  _callAsync: {
    value: createCompileDelegate('callAsync', 'async'),
    //略去非核心代码....
  },
});

module.exports = Hook;
```

略去拦截器实现与注册的特殊配置相关代码，以简单的例子做演示跟踪。

- 创建钩子跟踪:

  ```js
  const pluginHook = new SyncHook(['arg1', 'arg2']);
  ```

  1. 原型上定义了 \_call/\_promise/\_callAsync ，主要作用是为了防止命名冲突。
  2. 执行 `constructor` 构造函数，初始化私有属性。

- 注册函数跟踪:

  ```js
    instanceHook.tap('evt1',func1})
  ```

  1. 组织注册函数参数，增加到 taps 中(此处略去非核心功能)

  ```js
  // Hook 的 tap 中 ,此函数中包含拦截器对参数的重整
  this._insert({ type: 'sync', fn: func1, name: 'evt1' });

  // Hook 的 _insert 中 ,此函数中包含特殊配置改变 taps 中的注册顺序
  this._resetCompilation();
  this.taps[0] = { type: 'sync', fn: func1, name: 'evt1' };
  ```

- 执行注册跟踪:

  ```js
  instanceHook.call('param1', 'param2');
  ```

  1. 构造函数执行时， `this.call` 指向了 `this._call`，即为原型上的 `_call`,也即为 `createCompileDelegate('call', 'sync')` 的返回值。
  2. `createCompileDelegate` 通过 `_createCall` 返回了一个新的 `call`。
  3. `_createCall` 实际是将现有的钩子内部参数及由 `compile` 生成的函数。
  4. 上文提到各个钩子的 `compile` 是经过钩子类中重写了实现的， 而在 Hook 类相当于占位符。

  ```js
  //instanceHook.call('param1', 'param2') 相当于
  instanceHook.compile({
    taps: [{ type: 'sync', fn: func1, name: 'evt1' }],
    args: ['arg1', 'arg2'],
    type: 'sync',
  })('param1', 'param2');
  ```

回看 `SyncHook` 类中,`compile`的相关实现

```js
class SyncHookCodeFactory extends HookCodeFactory {
  content({ onError, onDone, rethrowIfPossible }) {
    return this.callTapsSeries({
      onError: (i, err) => onError(err),
      onDone,
      rethrowIfPossible,
    });
  }
}
const factory = new SyncHookCodeFactory();
class SyncHook extends Hook {
  compile(options) {
    factory.setup(this, options);
    return factory.create(options);
  }
}
```

为了探寻 `compile` 的具体实现,需要解析一下 `HookCodeFactory` 内部实现

```js
class HookCodeFactory {
  constructor(config) {
    this.config = config;
    this.options = undefined;
    this._args = undefined;
  }
  create(options) {
    this.init(options);
    let fn;
    switch (this.options.type) {
      case 'sync':
        fn = new Function(
          this.args(),
          '"use strict";\n' +
            this.header() +
            this.content({
              onError: (err) => `throw ${err};\n`,
              onResult: (result) => `return ${result};\n`,
              resultReturns: true,
              onDone: () => '',
              rethrowIfPossible: true,
            })
        );
        break;
      //省略......
    }
    this.deinit();
    return fn;
  }

  setup(instance, options) {
    instance._x = options.taps.map((t) => t.fn);
  }
  callTapsSeries({
    onError,
    onResult,
    resultReturns,
    onDone,
    doneReturns,
    rethrowIfPossible,
  }) {
    //省略......
    return code;
  }
  callTap(tapIndex, { onError, onResult, onDone, rethrowIfPossible }) {
    //省略......
    return code;
  }
  //省略......
}
```

由此可看出 `HookCodeFactory` 是一个根据钩子的内部参数生成代码字符串，再及由 `new Function()` 的方式返回代码。

SyncHook 生成的 call 为例:

```js
const SyncHook = require('./lib/SyncHook');

function func1() {
  console.log('注册函数1');
}
function func2() {
  console.log('注册函数2');
}
function func3() {
  console.log('注册函数3');
}
const hook = new SyncHook(['arg1', 'arg2']);
hook.tap('evt1', func1);
hook.tap('evt2', func2);
hook.tap('evt3', func3);
hook.call('param1', 'param2');
```

```js
function(arg1, arg2){
  "use strict";
  var _context;
  var _x = this._x;
  var _fn0 = _x[0];
  _fn0(arg1, arg2);
  var _fn1 = _x[1];
  _fn1(arg1, arg2);
  var _fn2 = _x[2];
  _fn2(arg1, arg2);
}

```

SyncWaterfallHook 生成的 call 为例:

```js
const SyncWaterfallHook = require('./lib/SyncWaterfallHook');

function func1() {
  console.log('注册函数1');
  return undefined;
}
function func2() {
  console.log('注册函数2');

  return 1;
}
function func3() {
  console.log('注册函数3');
  return undefined;
}
const hook = new SyncWaterfallHook(['arg1', 'arg2']);
hook.tap('evt1', func1);
hook.tap('evt2', func2);
hook.tap('evt3', func3);
hook.call('param1', 'param2');
```

```js
function(arg1, arg2){
  "use strict";
  var _context;
  var _x = this._x;
  var _fn0 = _x[0];
  var _result0 = _fn0(arg1, arg2);
  if(_result0 !== undefined) {
    arg1 = _result0;
  }
  var _fn1 = _x[1];
  var _result1 = _fn1(arg1, arg2);
  if(_result1 !== undefined) {
    arg1 = _result1;
  }
  var _fn2 = _x[2];
  var _result2 = _fn2(arg1, arg2);
  if(_result2 !== undefined) {
    arg1 = _result2;
  }
  return arg1;
}

```

AsyncParallelBailHook 生成的 call 为例:

```js
const AsyncParallelBailHook = require('./lib/AsyncParallelBailHook');

function func1(name, cb) {
  setTimeout(() => {
    cb();
  }, 10);
  return undefined;
}
function func2(name, data, cb) {
  console.log('注册函数2');
  setTimeout(() => {
    cb('this is error');
  }, 10);
  return 1;
}
function func3(cb) {
  console.log('注册函数3');
  cb();
  return undefined;
}
const hook = new AsyncParallelBailHook(['arg1', 'arg2']);
hook.tapAsync('evt1', func1);
hook.tapAsync('evt2', func2);
hook.tapAsync('evt3', func3);
hook.callAsync('param1', 'param2', function(err) {
  if (err) {
    console.err('err');
  }
  console.log('finish');
});
```

```js
function(arg1, arg2, _callback){
  "use strict";
  var _context;
  var _x = this._x;
  var _results = new Array(3);
  var _checkDone = () => {
    for (var i = 0; i < _results.length; i++) {
      var item = _results[i];
      if (item === undefined) return false;
      if (item.result !== undefined) {
        _callback(null, item.result);
        return true;
      }
      if (item.error) {
        _callback(item.error);
        return true;
      }
    }
    return false;
  };
  do {
    var _counter = 3;
    var _done = () => {
      _callback();
    };
    if (_counter <= 0) break;
    var _fn0 = _x[0];
    _fn0(arg1, arg2, (_err0, _result0) => {
      if (_err0) {
        if (_counter > 0) {
          if (
            0 < _results.length &&
            ((_results.length = 1),
            (_results[0] = { error: _err0 }),
            _checkDone())
          ) {
            _counter = 0;
          } else {
            if (--_counter === 0) _done();
          }
        }
      } else {
        if (_counter > 0) {
          if (
            0 < _results.length &&
            (_result0 !== undefined && (_results.length = 1),
            (_results[0] = { result: _result0 }),
            _checkDone())
          ) {
            _counter = 0;
          } else {
            if (--_counter === 0) _done();
          }
        }
      }
    });
    if (_counter <= 0) break;
    if (1 >= _results.length) {
      if (--_counter === 0) _done();
    } else {
      var _fn1 = _x[1];
      _fn1(arg1, arg2, (_err1, _result1) => {
        if (_err1) {
          if (_counter > 0) {
            if (
              1 < _results.length &&
              ((_results.length = 2),
              (_results[1] = { error: _err1 }),
              _checkDone())
            ) {
              _counter = 0;
            } else {
              if (--_counter === 0) _done();
            }
          }
        } else {
          if (_counter > 0) {
            if (
              1 < _results.length &&
              (_result1 !== undefined && (_results.length = 2),
              (_results[1] = { result: _result1 }),
              _checkDone())
            ) {
              _counter = 0;
            } else {
              if (--_counter === 0) _done();
            }
          }
        }
      });
    }
    if (_counter <= 0) break;
    if (2 >= _results.length) {
      if (--_counter === 0) _done();
    } else {
      var _fn2 = _x[2];
      _fn2(arg1, arg2, (_err2, _result2) => {
        if (_err2) {
          if (_counter > 0) {
            if (
              2 < _results.length &&
              ((_results.length = 3),
              (_results[2] = { error: _err2 }),
              _checkDone())
            ) {
              _counter = 0;
            } else {
              if (--_counter === 0) _done();
            }
          }
        } else {
          if (_counter > 0) {
            if (
              2 < _results.length &&
              (_result2 !== undefined && (_results.length = 3),
              (_results[2] = { result: _result2 }),
              _checkDone())
            ) {
              _counter = 0;
            } else {
              if (--_counter === 0) _done();
            }
          }
        }
      });
    }
  } while (false);
}

```

所有钩子都可以通过打印 `create` 打印出相应的当前 hook 执行的 call 函数。<br/>
本文主要目的为讲解 tapable 在 webpack 中的机制， 各个钩子生成代码的部分不一一进行解析。
源码中关键字解释:

- \_x: 注册函数的数组。
- \_context : 当前注册函数的执行上下文。 (bail/waterfall 等钩子的返回值需要判断或传递给后置函数，或有拦截器等情况)
- interceptors: 拦截器， 高级用法。
  ```js
  instanceHook.intercept({
    context: true,
    tap: (context, ...args) => {
      //....
    },
  });
  instanceHook.tap(
    {
      name: 'evtType',
      context: true,
    },
    (context, ...args) => {
      //....
    }
  );
  ```
- before : 在参数中的特殊标识，指 \_context 或 拦截器。
- after : 在参数中的特殊标识，指钩子执行结束后的最终回调函数。
