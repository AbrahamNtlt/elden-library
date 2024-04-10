### EventLoop

#### 概述

Event Loop， 即事件循环，是一种计算机运行机制。<br/>
JavaScript 引用 Event Loop 这一机制来解决自身单线程的一些问题。

> JavaScript 定位是浏览器的脚本语言，主要用来做交互操作。<br/>
> 为了避免复杂性，JavaScript 从诞生开始就一直是单线程。

#### 同步与异步

> 由于 JavaScript 是单线程，这意味着所有任务都必须排队挨个进行，当前一个任务执行完毕时，后一个任务才能开始执行。

##### 同步:任务直接执行，执行完成后移除任务

> 如死循环的代码，alert，prompt 将会造成后面代码执行的阻塞。

##### 异步:向系统发送出指令，待该任务满足执行条件后注册到任务队列中

> 如 ajax 请求，其结果当前不可预期，又不能因之造成阻塞。发送请求后，后续任务继续执行，待请求响应后，其回调函数将排列进任务队列中。

#### 执行栈与任务队列

- 执行栈:在 JavaScript 主线程中，当主线内的任务被清空后，将从任务队列中取进任务。
- 任务队列:线性列表数据，存储待执行的任务。

#### 宏任务与微任务

1. 宏任务（MacroTask）

- script
- setTimeout
- setInterval
- setImmediate
- I/O
- UI Render

2. 微任务（MicroTask）

- process.nextTick（nodejs）
- Promise
- Object.observe
- MutationObserver

#### 执行顺序（浏览器中）

1. 任务进入执行栈
2. 同步任务立即执行，执行完毕移出执行站。异步任务等待响应，响应后进入任务队列
3. 当任务队列清空后，若有可执行的微任务便将排入执行栈中，如无则将宏任务排入执行栈
4. 下一次任务循环

#### 例子

```js
setTimeout(() => {
  console.log('setTimeout 1');
  new Promise((resolve, reject) => {
    console.log('promise 1');
    resolve();
  }).then(() => {
      console.log('promise then 1');
    }).then(() => {
      console.log('promise then 2');
    });
  console.log('setTimeout 2');
}, 0);

console.log('script 1');

setTimeout(() => {
  console.log('setTimeout 3');
}, 0);

console.log('script 2');

//执行结果:
// script 1
// script 2
// setTimeout 1
// promise 1
// setTimeout 2
// promise then 1
// promise then 2
// setTimeout 3

```
