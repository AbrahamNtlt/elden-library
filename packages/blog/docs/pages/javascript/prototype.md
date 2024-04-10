### 原型链

#### 概述:

> 原型链是 JavaScript 实现继承的方式。

#### 原型:

```js
function Person() {
  this.name = 'Tomy';
}
const man = new Person();
man.name; //"Tomy"
man.__proto__ === Person.prototype;      //true
Person.prototype.constructor === Person; //true
```

> 如上段代码演示， `man` 是由构造函数 `Person` 所生成的实例。 <br>
> 实例 `man` 的隐式原型 `__proto__` 指向构造函数 `Person` 的显式原型 `prototype` 。<br>
> 而原型 `prototype` 的 `constructor` 又指向本构造函数 `Person` 。

```js
function Person() {
  this.name = 'Tomy';
}
function Worker() {
  this.salary = 1000;
}
const man = new Worker();
man.salary; //1000
man.name; //undefined
// 挂载原型
const people = new Person();
man.__proto__ = people;
man.name; //"Tomy"
man.hasOwnProperty('salary'); //true
man.hasOwnProperty('name');   //false
```

> 由 `Worker` 生成的实例 `man` 只有 `salary` 属性存在。<br>
> 当 `man` 的 `__proto__` 挂载到 `people` 之后便能访问到 `name` 属性。<br>
> 原因在于:当 js 对象没有该属性时，会在其所在的原型链上寻找相应原型的属性，直到找到或到达顶层原型(`Object` 的 `prototype` 为 `null`)。

#### new 关键字

> 由于 JavaScript 通过原型链的实现方式，`new` 关键字的作用不仅在于创建新的对象，同时也实现原型的继承。

```js
function Person() {
  this.name = 'Tomy';
  this.setName = function(name) {
    this.name = name;
  };
}
function createInstance(fn) {
  const relt = {};
  relt.__proto__ = fn.prototype;
  fn.call(relt);
  return relt;
}
const instance = createInstance(Person);
instance.name; //"Tomy"
instance.setName('Jack');
instance.name; //"Jack"
```

> `new` 关键字的作用就类似于上段代码中的 `createInstance` 。

#### class 、 extends 、 super

> `class` 是 `ES6` 新出现的语法，其创建实例的方式依旧是原型链。

```js
class Person {
  constructor() {
    this.name = 'Tomy';
  }
  work(){
    return 'job'
  }
}
class Worker extends Person {
  constructor() {
    super()
    this.salary = 1000;
  }
  draw(){
    return '领取' + this.salary
  }
}
const man = new Worker();
man.name;     //"Tomy"
man.work();   //"job"
man.salary;   //1000
man.draw();   //"领取1000"
man.hasOwnProperty('salary'); //true
man.hasOwnProperty('name');   //true
man.hasOwnProperty('work');   //false
man.hasOwnProperty('draw');   //false
man.__proto__ === Worker.prototype;       //true
man.__proto__.hasOwnProperty('draw');     //true
man.__proto__.hasOwnProperty('work');    //false
man.__proto__.__proto__ === Person.prototype;     //true
man.__proto__.__proto__.hasOwnProperty('work');   //true
```

>如上演示，`class` 中函数的 `this` 均指向了实例本身。 <br>
>`class` 中的函数挂载在 `prototype` 上，而并不挂载在实例上。<br>
>若继承的父类 `class` 存在 `constructor`，则子类 `class` 必须调用 `super()` 使实例上也有父类的属性。


#### Function
>`Function` 与 `Array` 、 `Number` 、 `Date` 等同样是继承于 `Object` 。<br>
>不同的是其余构建函数都返回一个实例，而`Function`返回动态函数。
```js
Function.prototype.__proto__.constructor === Object   //true
const fn = new Function('arg1','arg2','arg3','return arg1 + arg2 + arg3')
fn  //ƒ anonymous(arg1,arg2,arg3) {return arg1 + arg2 + arg3}
typeof fn  //'function'
fn.a = 1
fn.a  //1
```
> `Function` 的优点在于可以创建动态函数，但其性能比传统直接定义的方式开销大。


#### instanceof 关键字

```js
class Person {}
class Worker extends Person {}
const man = new Worker()
man instanceof Worker //true
man instanceof Person //true
man instanceof Object //true
man instanceof Array  //false
```
>当构建函数在其原型链上即返回 `true`。

```js
function isExtendsOf(Fn){
  let proto = this.__proto__;
  do{
    if(proto.constructor === Fn){
      return true
    }
    proto = proto.__proto__
  }while(proto)
  return false
}
class Person {}
class Worker extends Person {}
const man = new Worker()
isExtendsOf.call(man,Worker)  //true
isExtendsOf.call(man,Person)  //true
isExtendsOf.call(man,Array)   //false
```
>`instanceof` 类似于如上代码中的 `isExtendsOf` 。