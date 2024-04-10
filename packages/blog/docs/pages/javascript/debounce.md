# 手写防抖节流

## 防抖
持续频繁触发某个机制，则需要等待指定的时间再执行。

```js
/** 手写防抖
 * 用法：函数在 n 秒后再执行，如果 n 秒内被触发，重新计时，保证最后一次触发事件 n 秒后才执行。
 * 思路：
 *  1、保存一个变量 timer
 *  2、返回一个闭包函数 函数内判断一下 timer 是否有值
 *    2.1、如果有值 说明 定时器已经开启 需要将定时器清空
 *  3、设置定时器 等待 wait 后执行 将定时器赋值给 timer 记录
 *  4、通过 apply 执行函数 传入 arguments
 * @param {*} fn
 * @param {*} wait
 * @param {boolean} [immediate=false]
 * @return {*}
 */

function debounce(fn, wait, immediate) {
  let timer = null;
  return function (...args) {
    if (immediate && !timer) fn.apply(this, ...args);

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    timer = setTimeout(() => {
      clearTimeout(timer);
      timer = null;
      fn.apply(this, ...args);
    }, wait);
  };
}

```

## 节流
持续频繁触发某个机制，则需要保持特定时间内只执行一次。

```js
/** 手写节流
 * 用法：函数在 n 秒内只执行一次，如果多次触发，则忽略执行。
 * 思路：
 *  1、记录函数上一次执行的时间戳 startTime
 *  2、返回一个闭包函数 当被调用时会记录一下执行时间 nowTime
 *  3、比较两次执行时间间隔 是否超过了 wait 时间
 *  4、如果是大于 wait 时间 说明已经过了一个 wait 时间 可以执行函数
 *    4.1、更新 startTime 方便下次对比
 *    4.2、通过 apply 执行函数fn 传入 arguments 参数
 *  5、如果没有超过 wait 时间  说明是在 wait 时间内又执行了一次  忽略
 * @param {Function} fn 执行函数
 * @param {Number} wait 等待时间
 * @return {*}
 */

function throttle(fn, wait) {
  let startTime = Date.now();
  return function (...args) {
    const nowTime = Date.now();
    if (nowTime - startTime >= wait) {
      startTime = nowTime;
      return fn.apply(this, [...args]);
    }
  }
 }

```
