### Object

> 对象是人类思维模式所产生的一种抽象。计算机引入面向对象的概念也是让编程模式更接近人类思维的一种设计。

#### 唯一性

`object` 是一种引用类型数据，在计算机的栈中存储该指的内存地址，而在堆中存储具体的引用值。<br/>
不同的内存地址的数据即使值完全相同也代表不同的数据，内存地址是 `object` 数据的唯一标识。

```js
const b = { a: 1 };
const c = { a: 1 };

console.log(b == c); //false
console.log(b === c); //false
```

`object` 数据赋值给变量时，即赋值内存地址，而具体引用数据的改变不影响其内存地址改变。

```js
let a = 1;
let b = a;
a = 2;
console.log(b); //1
```

```js
let a = { key: 1 };
let b = { a };

console.log(a); //{ key: 1 }
console.log(b); //{ a: { key: 1 } }
console.log(b.a === a); //true
a.key = 2;
console.log(a); //{ key: 2 }
console.log(b); //{ a: { key: 2 } }
console.log(b.a === a); //true
a = 10;
console.log(a); //10
console.log(b); //{ a: { key: 2 } }
console.log(b.a === a); //false
```

#### 属性

> JavaScript 赋予对象在运行时动态修改与添加属性的能力。

JavaScript 的属性以 key-value 形式存在， 但并非简单的键值对。JavaScript 用一组特征（attribute）来描述属性（property）。

1. 数据属性

- value：属性的值。
- writable：属性能否被赋值。
- enumerable：决定 for in 能否枚举该属性。
- configurable：决定该属性能否被删除或者改变特征值。

大多数情况下，数据属性只关心取值。

2. 访问器属性

- getter：函数或 undefined，在取属性值时被调用。
- setter：函数或 undefined，在设置属性值时被调用。
- enumerable：决定 for in 能否枚举该属性。
- configurable：决定该属性能否被删除或者改变特征值。

访问器属性赋予对象在赋值取值时执行其他操作，甚至改变取值。其可视为函数的一种变形。
创建对象时，也可以使用 get 和 set 关键字来创建访问器属性。

```js
const obj = {
  get a() {
    return 1;
  },
};
obj.a; //1
```

属性的设置与查询 API：

- Object.defineProperty( obj , "prop" , { ...options } )
- Object.getOwnPropertyDescriptor( obj , "prop" )

对象可视为是一个属性的集合，key 值是属性的索引，而数据属性的值或访问器返回的值为该属性具体的值。

#### 宿主对象

JavaScript 运行环境所提供的对象，如：浏览器中的 window。

#### 内置对象

JavaScript 运行时自动创建的对象，这些对象的功能几乎无法用纯 JavaScript 来实现。<br/>

内置对象含有私有属性 `[[class]]` ，该访问属性不可覆盖和读取，仅可用原型上的 `toString` 获取。

```js
Object.prototype.toString.call([]); //"[object Array]"
```

#### 函数对象与构造器对象

> 此描述是看待对象分类的另一个视角。

函数对象：具有私有属性 `[[call]]` 的对象。<br>

构造器对象：具有私有属性 `[[construct]]` 的对象。<br>

一个对象可以同时是函数对象与构造器对象，也可以两者都不是。

```js
new Date(); //Wed May 13 2020 13:47:00 GMT+0800 (China Standard Time) {}
Date(); //"Wed May 13 2020 13:47:11 GMT+0800 (China Standard Time)"
```

```js
new Image(); //<img>
Image(); //TypeError
```

#### class

es6 新增关键字，可以定义类。`extends` 实现类的继承。 <br>

`class` 的 `typeof` 返回值为 `"function"`，但与函数不同。`class` 不存在变量提升，也不允许直接调用。<br>

`class` 实现的继承方式依旧是 `原型链` ，内部具体实现方式与 `构造函数` 稍有不同。<br>

#### 手写深拷贝

```js
function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  let relt = {};
  if (Object.prototype.toString.call(obj) === '[object array]'){
    relt = []
  }
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      relt[key] = deepCopy(obj[key]);
    }
  }
  return relt;
}
```
