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
