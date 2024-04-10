### Promise


> 在没有promise之前，所有异步代码都是用回调函数处理。而随着 JavaScript 的发展庞大，回调函数的处理方式在开发上的问题愈加明显。

- 多重嵌套的回调地狱，代码难以维护。
- 由于异步操作导致语句无法使用的 return 与 try/catch 。
- 回调函数之前难以建立联系，需要在共同的外层作用域增加标识。

#### promiseA+规范

promiseA+规范是 es5 提出引入的，内容包括：

1. 不管做什么操作都返回一个 promise 对象

2. promise 有三种状态：

```
1. Unfulfilled  （初始状态）
2. Fulfilled    （完成）
3. Failed       （失败）
promise的状态单向且不可逆。
```

3.then 执行的是上一个 promise 对象，而注册函数则是第一个 promise。

> then 返回的是一个新的 promise 对象，当上一个 promise 的回调执行结束后，新 promise 的状态变为 fulfilled。新 promise 的 then 执行又再次生成新的 promise 对象 ，依此类推就形成了链式调用。

promiseA+ 规范的实现：

- ES6：Promise，yield。
- ES7：async，await。
- Angular：\$q。
- Node：q，co，then。

> 此处开始下文中的 Promise 即指 ES6 的 Promise

#### ES6 Promise

Promise 为一个构造器对象，只能使用通过 new 关键字生成实例。

promise 的三种状态：

1. Pending （ 对应 Unfulfilled ）
2. Fulfilled（ 对应 Fulfilled ）
3. Rejected （ 对应 Failed ）

fulfilled 与 rejected 状态也被称为 settled 状态，或被称为 resolved。

- Promise.prototype.then(onFulfilled,onRejected)
  > promise 进入 Fulfilled 状态后执行，并返回一个新 promise 实例<br>
  > 当 then 有第二个参数 onRejected 时，promise 进入 Rejected 状态后执行， 并返回一个新 promise 实例
- Promise.prototype.catch(onRejected)
  > promise 进入 Rejected 状态后执行， 并返回一个新 promise 实例
- Promise.prototype.finally(onSettled)
  > promise 进入 Settled 状态后执行，并返回一个新 promise 实例<br>
  > finally 并不会终结链式执行<br>
  > onSettled 不接受 promise 的返回值<br>
  > finally 所生成的 promise 以上一个 then 的返回值进入 Fulfilled 状态，以自身的返回值 返回值进入 Rejected 状态。
- Promise.resolve(value)
  > 返回一个 settled 状态的 promise，具体 settled 状态由该 value 的 then 决定。<br>
  > 当返回的 value 为空或者为基本类型的数据或者不带 `then` 方法的对象时，promise 状态为 fulfilled。
- Promise.reject(reason)
  > 返回 rejected 状态的 promise

```js
new Promise(function(resolve, reject) {
  resolve(1);
})
  .then(function(data) {
    console.log(data);
    return 2;
  })
  .finally(function(data) {
    console.log(data);
    return Promise.resolve(3);
  })
  .then(function(data) {
    console.log(data);
    return 4;
  })
  .then(function(data) {
    console.log(data);
    return Promise.reject(5);
  })
  .finally(function(data) {
    console.log(data);
    return Promise.reject(6);
  })
  .catch((err) => {
    console.log(err);
    return 7;
  })
  .then((data) => {
    console.log(data);
  });

// 1 undefined 2 4 undefined 6 7
```

##### 模拟 Promise 实现

```js
function _Promise(fn) {
  // 1.定义好初始状态与初始值
  const pendingState = Symbol('pending');
  const fulfilledState = Symbol('fulfilled');
  const rejectedState = Symbol('rejected');
  let state = pendingState;
  let value = null;
  let isDone = false;
  const callbacks = [];

  // 2.定义好 resolve/reject 及其运作的相关函数
  function resolve(newVal) {
    const fn = () => {
      if (state !== pendingState) {
        return;
      }
      if (
        newVal &&
        (typeof newVal === 'object' || typeof newVal === 'function')
      ) {
        const { then } = newVal;
        if (typeof then === 'function') {
          // 当 then 内部返回一个新的 _Promise 则必须先调用该实例的 then 方法
          then.call(newVal, resolve, reject);
          return;
        }
      }
      state = fulfilledState;
      if (!isDone) {
        value = newVal;
      }
      executeCb();
    };
    // 用setTimeout 模拟事件循环
    setTimeout(fn, 0);
  }
  // 与 resolve 大体类似
  function reject(error) {
    if (state !== pendingState) {
      return;
    }
    if (error && (typeof error === 'object' || typeof error === 'function')) {
      const { then } = error;
      if (typeof then === 'function') {
        then.call(error, resolve, reject);
        return;
      }
    }
    state = rejectedState;
    value = error;
    executeCb();
  }
  // 注册/执行回调
  function handle(callback) {
    // 注册
    if (state === pendingState) {
      callbacks.push(callback);
      return;
    }
    // 执行
    const cb =
      state === fulfilledState ? callback.onFulfilled : callback.onRejected;
    const next = state === fulfilledState ? callback.resolve : callback.reject;
    // 当不注册对应函数则跳入下一轮
    if (!cb) {
      next(value);
      return;
    }
    try {
      // finally 指向 undefined
      const param = isDone ? undefined : value;
      const newVal = cb(param);
      next(newVal);
    } catch (error) {
      callback.reject(error);
    }
  }
  // 消费初始Promise上所注册的回调
  function executeCb() {
    while (callbacks.length) {
      const fn = callbacks.shift();
      handle(fn);
    }
  }
  // 3.编写实例的 then , 每次返回新的 _Promise 实例
  this.then = (onFulfilled, onRejected) => {
    isDone = false;
    return new _Promise((resolve, reject) => {
      handle({
        resolve,
        reject,
        onFulfilled,
        onRejected,
      });
    });
  };
  this.catch = (onError) => {
    this.then(null, onError);
  };
  this.finally = (onDone) => {
    isDone = true;
    return new _Promise((resolve, reject) => {
      handle({
        resolve,
        reject,
        onFulfilled: onDone,
        onRejected: onDone,
      });
    });
  };
  fn(resolve, reject);
}
// 4. resolve/reject 函数挂载在 _Promise 对象上
_Promise.resolve = function(value) {
  if (value && value instanceof _Promise) {
    return value;
  }
  if (value && typeof value === 'object' && typeof value.then === 'function') {
    const { then } = value;
    return new _Promise((resolve) => {
      then(resolve);
    });
  }
  if (value) {
    return new _Promise((resolve) => resolve(value));
  }
  return new _Promise((resolve) => resolve());
};

_Promise.reject = function(value) {
  return new _Promise((resolve, reject) => {
    reject(value);
  });
};
```

##### Promise.all(iterable)

> Promise.all 接收类数组结构的 promise 数据<br>
> 当 iterable 内的 promise 都为 fuifilled 状态时，Promise.all 返回 fuifilled 状态的 promise。
> 其返回值为一个将 iterable 内 promise 的返回值以相同的顺序组合成的数组。<br>
> 当 iterable 内的 promise 出现 rejected 状态时，Promise.all 返回 rejected 状态的实例，其值为出现 rejected 状态的 promise 的返回值。

```js
// 模拟 Promise.all 实现
_Promise.all = function(iterable) {
  const args = Array.prototype.slice.call(iterable);
  console.log(args);
  if (!args.length) {
    return _Promise.resolve([]);
  }
  let relt = [];
  return new _Promise((resolve, reject) => {
    let remaining = args.length;
    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          const { then } = val;
          if (typeof then === 'function') {
            // 改写resolve
            then.call(
              val,
              (val) => {
                res(i, val);
              },
              reject
            );
            return;
          }
        }
        relt[i] = val;
        if (--remaining === 0) {
          resolve(relt);
        }
      } catch (ex) {
        console.log(ex);
        reject(ex);
      }
    }
    for (let i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};
```

##### Promise.race(iterable)

> Promise.race 也是接收类数组结构的 promise 数据，返回第一个进入 settled 状态的 promise。

```js
// 模拟 race 实现
_Promise.race = function(iterable) {
  const args = Array.prototype.slice.call(iterable);
  return new Promise((resolve, reject) => {
    for (let i = 0, len = args.length; i < len; i++) {
      args[i].then(resolve, reject);
    }
  });
};
```


#### async / await

es7 新增语法，支持同步的方式编写异步函数

```js
function resolve(){
  return new Promise((res,rej)=>{
    setTimeout(res("异步返回"),2000)
  })
}

(async function (){
  const relt = await resolve()
  const res = resolve()

  console.table(relt,res)   // "异步返回" ,   Promise {<resolved>: "异步返回"}
})()

```


