### this

#### 概述:

在 JavaScript 中，`this` 是指当前函数中正在执行上下文环境。

#### 正常情况下的 this

> 默认指向调用函数的对象。

```js
const person = {
  name: 'Tom',
  talk() {
    return this.name;
  },
};
person.talk(); //'Tom'
```

> 当函数在顶层作用域调用时，指向全局变量。

```js
function print() {
  console.log(this);
}
print(); //Window    (浏览器中)
```

####  启用严格模式后，`this` 将默认指向 `undefined` 。

```js
function print() {
  'use strict';
  console.log(this);
}
print(); //undefined
```

> PS: 函数与方法之间没有明显区分，方法偏向于面向对象的说法。

#### 构造函数中的 this

```js
function Person(name) {
  this.name = name;
}
const person = new Person('Tom');
console.log(person.name); //'Tom'
```

> 通过 `new`关键字，`this` 指向新生成的实例。

#### 箭头函数中的 this

```js
class Obj {
  get() {
    return () => {
      return () => {
        return this;
      };
    };
  }
}
let obj = new Obj();
console.log(obj.get()()() === obj); //true

obj = {
  get: () => {
    return this;
  },
};
console.log(obj.get() === obj); //false
console.log(obj.get() === window); //true
```

```js
var a = 100;
const fn1 = () => {
  console.log(this.a);
};
function fn2() {
  console.log(this.a);
}
const obj = { a: 1 };
fn1(); //100
fn2(); //100
fn1.apply(obj); //100
fn2.apply(obj); //1
```

> 箭头函数的 `this` ,指向函数定义时的`执行上下文`,即使用 `call`、`apply`、`bind` 也不改变。

#### call apply bind

- `call`、 `apply`、 `bind`非箭头函数下都能改变函数内 this 的指向。
- `call` 第二个参数开始都是函数执行的参数。
- `apply` 第二个参数接受一个数组，数组内的元素依次为函数执行的参数。
- `bind` 返回不立即执行的一个自定义函数，第二个参数开始都是原函数执行的参数，而自定义函数的传参将成为续`bind`参数后的原函数执行参数。

```js
var a = 1,
  b = 2;
function print(c, d) {
  console.table(this.a, this.b, c, d);
}
print(3, 4);
// 1 2 3 4

print.call(
  {
    a: 10,
    b: 20,
  },
  30,
  40
);
//10 20 30 40

print.apply(
  {
    a: 100,
    b: 200,
  },
  [300, 400]
);
// 100 200 300 400

const fn = print.bind(
  {
    a: 1000,
    b: 2000,
  },
  3000
);
fn(4000);
//1000 2000 3000 4000
```
#### 手写call
```js
Function.prototype._call = function(ctx,...params){
  // 1.处理传参的可能出现的特殊情况
  if(ctx === null || ctx === undefined){
    ctx = window 
  }else if(!ctx instanceof Object){
    ctx = Object(ctx)
  }
  //给予唯一标识  避免对参数的原属性覆盖
  const temp = Symbol()
  ctx[temp] = this;
  // 执行函数并接收返回值
  const relt = ctx[temp](...params)
  // 回收
  delete ctx[temp]
  return relt
}
var a = 1 
function fn(b){
  console.log(this.a,b)
}
fn(2)     //1 2
const obj ={
  a: 10
}
fn._call(obj,3) //10 3
```

#### 手写 apply

```js
//与 call 同理
Function.prototype._apply = function(ctx,arr){
  if(ctx ===null || ctx ===undefined){
    ctx = window 
  }else if(!ctx instanceof Object){
    ctx = Object(ctx)
  }
  const temp = Symbol()
  ctx[temp] = this;
  const relt = ctx[temp](...arr)
  delete ctx[temp]
  return relt
}
var a = 1 
function fn(b,c,d){
  console.log(this.a,b,c,d)
}
fn(2,4,6)     //1 2 4 6
const obj ={
  a: 10
}
fn._apply(obj,[3,5,7]) //10 3 5 7
```

#### 手写 bind
```js
Function.prototype._bind = function(ctx,...params){
  if(ctx ===null || ctx ===undefined){
    ctx = window 
  }else if(!ctx instanceof Object){
    ctx = Object(ctx)
  }
  const _this = this
  // 使用闭包返回
  return function (...rest){
    const temp = Symbol()
    ctx[temp] = _this;
    const relt = ctx[temp](...params,...rest)
    delete ctx[temp]
    return relt
  }
}
var a = 1 
function fn(b,c,d){
  console.log(this.a,b,c,d)
}
fn(2,4,6)     //1 2 4 6
const obj ={
  a: 10
}
const newFn = fn._bind(obj,3)
newFn(5,7)   //10 3 5 7
```
