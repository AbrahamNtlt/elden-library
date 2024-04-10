# Promise

## 1. 建立基础的构造函数

### 需求

基于 [Promises/A+ (promisesaplus.com)](https://link.juejin.cn/?target=https%3A%2F%2Fpromisesaplus.com%2F) ,
我们需要实现:

1. `promise` 有三个状态：`pending`(未完成)，`fulfilled`(完成)，or `rejected`(拒绝)。初始状态为 `pending`
   ，且状态结束只能从`pending`改为`fulfilled`或者`rejected`，
   `promise`的状态改变为单向且不可逆。
2. `promise`接收一个`executor`执行器，立即执行。`executor`接受两个参数，分别是`resolve`和`reject`来表示`promise`进入对应状态。

### 实现基础类型的封装

```ts
//  actionType.ts

enum statusEnum {
  pending,
  fulfilled,
  rejected
}

type Resolve = (value: any) => any
type Reject = (reason: any) => any
type Executor = (resolve: Resolve, reject: Reject) => any


export {statusEnum, Resolve, Reject, Executor}
```

### 实现基本版的构造器

```ts
// TPromise.ts

import {Executor,Reject, Resolve, statusEnum} from "./actionType";

export default class TPromise {

  private status = statusEnum.pending;
  private value: any;
  private reason: any;

  constructor(executor: Executor) {
    const resolve: Resolve = (value) => {
      if (this.status === statusEnum.pending) {
        this.status = statusEnum.fulfilled
        this.value = value
        console.log(this.value) // test
      }
    }

    const reject: Reject = (reason) => {
      if (this.status === statusEnum.pending) {
        this.status = statusEnum.rejected
        this.reason = reason
        console.log(this.reason)  // test
      }
    }
    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }
}
```

### 执行测试代码

```ts
import TPromise from './TPromise'

const p1 = new TPromise((resolve, reject) => {
  resolve('p1-resolve')
  reject('p1-reject')
})


const p2 = new TPromise((resolve, reject) => {
  reject('p2-reject')
  resolve('p2-resolve')
})

const p3 = new TPromise((resolve, reject) => {
  throw new Error()
  reject('p3-reject')
  resolve('p3-resolve')
})

// 正确输出:
// p1-resolve
// p2-reject
// Error: xxxx
```

## 2. 实现基础 `then` 方法

### 需求

1. `promise` 有一个`then`方法，`then` 接收两个参数，分别是成功的回调 `onFulfilled`，和失败的回调 `onRejected`；
2. 执行`onFulfilled`，参数是`promise`的`value`。
3. 执行`onRejected`，参数是`promise`的`reason`。
4. `promise` 可以 `then` 多次，每次执行完 `promise.then` 方法后返回的都是一个新的`promise`。

### 补充类型

```ts
// actionTyep.ts

import type TPromise from "./TPromise";

type OnFulfilled = ((value: any) => any) | null | undefined
type OnRejected = ((reason: any) => any) | null | undefined
type Then = (onFulfilled: OnFulfilled, onRejected: OnRejected) => TPromise
```

### 模拟微任务

```ts
// shared.ts

export function runMicroTask(func: (val: any) => void) {
  if (undefined !== process && typeof process === 'object' && typeof process.nextTick === 'function') {
    process.nextTick(func)
  } else if (typeof MutationObserver === 'function') {
    const ob = new MutationObserver(func)
    const textNode = document.createTextNode('1')
    ob.observe(textNode, {
      characterData: true
    })
    textNode.data = '2'
  } else {
    setTimeout(func, 0)
  }
}

```

### 实现基础 `then` 代码

```ts
import {Executor, OnFulfilled, OnRejected, Reject, Resolve, statusEnum, Then} from "./actionType";

export default class TPromise {
  then: Then = (onFulfilled: OnFulfilled, onRejected: OnRejected) => {
    return new TPromise((resolve, reject) => {
      if (this.status === statusEnum.fulfilled) {
        onFulfilled(this.value)
      } else if (this.status === statusEnum.rejected) {
        onRejected(this.reason)
      } else {
        //xxx
      }
    })
  }
}
```

### 测试代码

```ts
import TPromise from './TPromise'

console.log(0)
const p1 = new TPromise((resolve, reject) => {
  resolve('p1-resolve')
})

p1.then(res => {
  console.log('fulfilled', res)
}, null)

console.log(1)
const p2 = new TPromise((resolve, reject) => {
  reject('p2-reject')
})

p2.then(null, err => {
  console.log('reject', err)
})

console.log(2)

// 成功执行: 
// 0
// 1
// 2
// fulfilled p1-resolve
// reject p2-reject

```

## 3. 实现完整 `then` 方法

### 需求

1. `then` 的参数 `onFulfilled` 和 `onRejected` 可以缺省，如果 `onFulfilled` 或者 `onRejected`
   不是函数，将其忽略，且依旧可以在下面的 `then` 中获取到之前返回的值。
2. 如果 `then` 的返回值 `x` 是一个普通值，那么就会把这个结果作为参数，传递给下一个 `then` 的成功的回调中。
3. 如果 `then` 中抛出了异常，那么就会把这个异常作为参数，传递给下一个 `then` 的失败的回调中。
4. 如果 `then` 的返回值 `x` 实现了一个 `then` 方法，则视为 `thenable`，那么会等这个 `thenable` 执行完，`thenable`
   如果成功，就走下一个 `then` 的成功。如果失败，就走下一个 `then` 的失败。如果抛出异常，就走下一个 `then` 的失败。
5. 如果 `then` 的返回值 `x` 和 `promise` 是同一个引用对象，造成循环引用，则抛出异常，把异常传递给下一个 `then` 的失败的回调中。
6. 如果 `then` 的返回值 `x` 是一个 `thenable`，且 `x` 同时调用 `resolve` 函数和 `reject` 函数，则第一次调用优先，其他所有调用被忽略。

### 实现 `x` 多重嵌套返回 `thenable`的执行

```ts
// TPromise.ts

const resolvePromise = (promise: TPromise, x: any, resolve: Resolve, reject: Reject) => {
  // 循环返回promise
  if (promise === x) {
    return reject(new Error('cycle!!'))
  }  
  let called: boolean;

  if (isThenAble(x)) {
    try {
      let then = x.then;
      then.call(x, (res: any) => { // 根据 promise 的状态决定是成功还是失败
        if (called) return;
        called = true;
        resolvePromise(promise, res, resolve, reject);
      }, (err: any) => {
        if (called) return;
        called = true;
        reject(err);
      })
    } catch (err) {
      if (called) return;
      called = true;
      reject(err)
    }
  } else {
    // 如果 x 是个普通值就直接返回 resolve 作为结果  Promise/A+ 2.3.4  
    resolve(x)
  }
}

```

### 封装`then`的回调执行

```ts
// TPromise.ts

function execCallBack(promise: TPromise, handler: OnFulfilled | OnRejected, payload: any, resolve: Resolve, reject: Reject) {
  runMicroTask(() => {
    try {
      const x = handler(payload);
      resolvePromise(promise, x, resolve, reject);
    } catch (err) {
      reject(err)
    }
  })
}
```

### 实现完整的 `then` 方法

```ts
export default class TPromise {

   private onResolvedCallbacks: (() => void)[] = [];
   private onRejectedCallbacks: (() => void)[] = [];

   then: Then = (onFulfilled?: OnFulfilled, onRejected?: OnRejected) => {
       // 处理穿透
       if (!isFunc(onFulfilled)) onFulfilled = res => res
       if (!isFunc(onRejected)) onRejected = err => {
         throw err
       }
       const p = new TPromise((resolve, reject) => {
         if (this.status === statusEnum.fulfilled) {
           execCallBack(p, onFulfilled!, this.value, resolve, reject)
         } else if (this.status === statusEnum.rejected) {
           execCallBack(p, onRejected!, this.reason, resolve, reject)
         } else {
           this.onResolvedCallbacks.push(() => execCallBack(p, onFulfilled!, this.value, resolve, reject))
           this.onRejectedCallbacks.push(() => execCallBack(p, onRejected!, this.reason, resolve, reject));
         }
       })
       return p
  }
}
```

## 4. 实现其余API

### 需求

1. 实现 `catch` 方法
2. 实现 `finally` 方法
3. 实现静态方法 `reslove`
4. 实现静态方法 `reject`
5. 实现静态方法 `all`
6. 实现静态方法 `race`
7. 实现静态方法 `allSettled`

### 完整代码

```ts
// TPromise.ts

import {Executor, OnFulfilled, OnRejected, Reject, Resolve, statusEnum, Then} from "./actionType";
import {isFunc, isThenAble, runMicroTask} from "./shared";

export default class TPromise {
  private status = statusEnum.pending;
  private value: any;
  private reason: any;
  private onResolvedCallbacks: (() => void)[] = [];
  private onRejectedCallbacks: (() => void)[] = [];

  constructor(executor: Executor) {
    const resolve: Resolve = (value?) => {
      if (this.status === statusEnum.pending) {
        this.status = statusEnum.fulfilled
        this.value = value
        this.onResolvedCallbacks.forEach(fn => fn())
      }
    }

    const reject: Reject = (reason?) => {
      if (this.status === statusEnum.pending) {
        this.status = statusEnum.rejected
        this.reason = reason
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }
    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  then: Then = (onFulfilled?: OnFulfilled, onRejected?: OnRejected) => {
    // 处理穿透
    if (!isFunc(onFulfilled)) onFulfilled = res => res
    if (!isFunc(onRejected)) onRejected = err => {
      throw err
    }
    const p = new TPromise((resolve, reject) => {
      if (this.status === statusEnum.fulfilled) {
        execCallBack(p, onFulfilled!, this.value, resolve, reject)
      } else if (this.status === statusEnum.rejected) {
        execCallBack(p, onRejected!, this.reason, resolve, reject)
      } else {
        this.onResolvedCallbacks.push(() => execCallBack(p, onFulfilled!, this.value, resolve, reject))
        this.onRejectedCallbacks.push(() => execCallBack(p, onRejected!, this.reason, resolve, reject));
      }
    })
    return p
  }


  catch(onRejected?: Reject) {
    return this.then(v => v, onRejected)
  }

  finally(onFinally: () => void) {
    return this.then((res) => {
      onFinally()
      return res
    }, err => {
      onFinally()
      throw err
    })
  }

  static resolve(value?) {
    if (value instanceof TPromise) return value
    let _resolve, _reject
    const p = new TPromise((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })
    if (isThenAble(value)) {
      value.then(_resolve, _reject)
    } else {
      _resolve!(value)
    }
    return p
  }

  static reject(reason?) {
    return new TPromise((_, reject) => {
      reject(reason);
    })
  }

  static all(promises: TPromise[]) {
    return new TPromise((resolve, reject) => {
      const results = []
      let order = 0
      const processResultItem = (value, index) => {
        results[index] = value
        if (++order === promises.length) {
          resolve(results)
        }
      }
      for (let i = 0; i < promises.length; i++) {
        let value = promises[i];
        if (isThenAble(value)) {
          value.then((value) => {
            processResultItem(value, i);
          }, reject);
        } else {
          processResultItem(value, i);
        }
      }
    })
  }

  static race(promises: TPromise[]) {
    return new TPromise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        let value = promises[i];
        if (isThenAble(value)) {
          value.then(resolve, reject);
        } else {
          resolve(value);
        }
      }
    })
  }

  static allSettled(promises: TPromise[]) {
    return new TPromise((resolve, reject) => {

      let settledCount = 0;
      const results = [];

      if (promises.length === 0) {
        resolve(results);
      }

      promises.forEach((promise, index) => {
        Promise.resolve(promise)
            .then(value => {
              results[index] = {status: 'fulfilled', value};
            })
            .catch(reason => {
              results[index] = {status: 'rejected', reason};
            })
            .finally(() => {
              settledCount++;
              if (settledCount === promises.length) {
                resolve(results);
              }
            });
      });
    });
  }
}
const resolvePromise = (promise: TPromise, x: any, resolve: Resolve, reject: Reject) => {
  // 循环返回promise
  if (promise === x) {
    return reject(new Error('cycle!!'))
  }
  let called: boolean;

  if (isThenAble(x)) {
    try {
      let then = x.then;
      then.call(x, (res: any) => { // 根据 promise 的状态决定是成功还是失败
        if (called) return;
        called = true;
        resolvePromise(promise, res, resolve, reject);
      }, (err: any) => {
        if (called) return;
        called = true;
        reject(err);
      })
    } catch (err) {
      // @ts-ignore
      if (called) return;
      called = true;
      reject(err)
    }
  } else {
    // 如果 x 是个普通值就直接返回 resolve 作为结果  Promise/A+ 2.3.4
    resolve(x)
  }


}

function execCallBack(promise: TPromise, handler: OnFulfilled | OnRejected, payload: any, resolve: Resolve, reject: Reject) {
  runMicroTask(() => {
    try {
      const x = handler!(payload);
      resolvePromise(promise, x, resolve, reject);
    } catch (err) {
      reject(err)
    }
  })
}

```



```ts
// actionType.ts
import type TPromise from "./TPromise";

enum statusEnum {
  pending,
  fulfilled,
  rejected
}

type Resolve = (value?: any) => any
type Reject = (reason?: any) => any
type Executor = (resolve: Resolve, reject: Reject) => any

type OnFulfilled = (value: any) => any
type OnRejected = ((reason: any) => any)
type Then = (onFulfilled?: OnFulfilled, onRejected?: OnRejected) => TPromise

export {statusEnum, Resolve, Reject, Executor, OnFulfilled, OnRejected, Then}

```

```ts
// shared.ts
export function isFunc(obj: any) {
  return typeof obj === 'function'
}

export function isObj(obj: any) {
  return obj !== null && typeof obj === 'object'
}

export function runMicroTask(func: (val: any) => void) {
  if (undefined !== process && typeof process === 'object' && typeof process.nextTick === 'function') {
    process.nextTick(func)
  } else if (typeof MutationObserver === 'function') {
    const ob = new MutationObserver(func)
    const textNode = document.createTextNode('1')
    ob.observe(textNode, {
      characterData: true
    })
    textNode.data = '2'
  } else {
    setTimeout(func, 0)
  }
}

export function isThenAble(val: any) {
  if (isObj(val) || isFunc(val)) {
    return isFunc(val.then)
  }
  return false
}

```

### 执行测试用例

```ts
// jest
import TPromise from "../src/TPromise";

describe('TPromise', () => {
  // 成功状态测试
  describe('fulfilled', () => {
    it('should call onFulfilled with correct value', () => {
      const value = 42;
      const promise = TPromise.resolve(value);

      return new Promise<void>((resolve) => {
        promise.then((val) => {
          expect(val).toEqual(value);
          resolve();
        });
      });
    });
  });

  // 拒绝状态测试
  describe('rejected', () => {
    it('should call onRejected with correct reason', () => {
      const reason = 'Error occurred';
      const promise = TPromise.reject(reason);

      return new Promise<void>((resolve) => {
        promise.catch((err) => {
          expect(err).toEqual(reason);
          resolve();
        });
      });
    });
  });

  // then 方法测试
  describe('then', () => {
    it('should return a Promise', () => {
      const promise = TPromise.resolve();
      const thenResult = promise.then();

      expect(thenResult).toBeInstanceOf(TPromise);
    });

    it('should catch and propagate rejections from onFulfilled', () => {
      const reason = 'Error occurred';
      const promise = TPromise.resolve();

      return new Promise<void>((resolve) => {
        promise.then(() => {
          throw reason;
        }).catch((err) => {
          expect(err).toEqual(reason);
          resolve();
        });
      });
    });

    it('should catch and propagate rejections from onRejected', () => {
      const reason = 'Error occurred';
      const promise = TPromise.reject();

      return new Promise<void>((resolve) => {
        promise.then(null, () => {
          throw reason;
        }).catch((err) => {
          expect(err).toEqual(reason);
          resolve();
        });
      });
    });
  });

  // Promise.resolve 方法测试
  describe('resolve', () => {
    it('should return a Promise resolved with the given value', () => {
      const value = 42;
      const promise = TPromise.resolve(value);

      return new Promise<void>((resolve) => {
        promise.then((val) => {
          expect(val).toEqual(value);
          resolve();
        });
      });
    });
  });

  // Promise.reject 方法测试
  describe('reject', () => {
    it('should return a Promise rejected with the given reason', () => {
      const reason = 'Error occurred';
      const promise = TPromise.reject(reason);

      return new Promise<void>((resolve) => {
        promise.catch((err) => {
          expect(err).toEqual(reason);
          resolve();
        });
      });
    });
  });

  // Promise.all 方法测试
  describe('all', () => {
    it('should return a Promise that fulfills when all the input Promises fulfill', () => {
      const promise1 = TPromise.resolve(1);
      const promise2 = TPromise.resolve(2);
      const promise3 = TPromise.resolve(3);

      return TPromise.all([promise1, promise2, promise3]).then((values) => {
        expect(values).toEqual([1, 2, 3]);
      });
    });

    it('should return a Promise that rejects if any of the input Promises rejects', () => {
      const reason = 'Error occurred';
      const promise1 = TPromise.resolve();
      const promise2 = TPromise.reject(reason);
      const promise3 = TPromise.resolve();

      return TPromise.all([promise1, promise2, promise3]).catch((err) => {
        expect(err).toEqual(reason);
      });
    });
  });

  // Promise.race 方法测试
  describe('race', () => {
    it('should return a Promise that fulfills when the first input Promise fulfills', () => {
      const promise1 = TPromise.resolve(1);
      const promise2 = new TPromise((resolve) => {
        setTimeout(() => resolve(2), 100);
      });

      return TPromise.race([promise1, promise2]).then((value) => {
        expect(value).toEqual(1);
      });
    });

    it('should return a Promise that rejects when the first input Promise rejects', () => {
      const reason = 'Error occurred';
      const promise1 = TPromise.reject(reason);
      const promise2 = new TPromise((resolve) => {
        setTimeout(() => resolve(2), 100);
      });

      return TPromise.race([promise1, promise2]).catch((err) => {
        expect(err).toEqual(reason);
      });
    });
  });


  describe('allSettled', () => {
    it('should return a Promise that fulfills with an array of result objects when all input Promises settle', () => {
      const promise1 = TPromise.resolve(1);
      const promise2 = TPromise.reject('Error occurred');
      const promise3 = new TPromise((resolve) => {
        setTimeout(() => resolve(3), 100);
      });

      return TPromise.allSettled([promise1, promise2, promise3]).then((results) => {
        expect(results).toEqual([
          {status: 'fulfilled', value: 1},
          {status: 'rejected', reason: 'Error occurred'},
          {status: 'fulfilled', value: 3}
        ]);
      });
    });
  });
});

```

