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
