### typescript

what: 一个类型增强型的编程语言,是 JavaScript 的一个超集

why: 增加了代码的可读性与维护性

- 在编写过程推断了数据类型,很大程度的提高了程序的可读性
- 在编译过程中就可以检测出异常,借此减少运行时的错误(不管是开发阶段还是已上线的项目)
- 增强了编辑器和 IDE 的功能，包括代码补全、接口提示、跳转到定义、重构等

#### 数据类型推断:

用 `:` 推断数据类型:

1. 变量:

```js
let name: string = `Gene`;
```

2. 函数:

```js
function add(x: number, y: number): number {
  return x + y;
}
```

3. 类和接口:

```js
interface LabelledValue {
  label: string;
}
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    return 'Hello, ' + this.greeting;
  }
}
```

断言: `<T>` 与 `as` 效果一样

```js
let someValue: any = "this is a string";

let strLength: number = (<string>someValue).length;
let strLength: number = (someValue as string).length;
```
类型判断断言
```js
function isString(x: any): x is string {
    return typeof x === "string";
}
```

联合类型 `|`

```js
function padLeft(value: string, padding: string | number) {
    // ...
}
```

交叉类型（mixins）: `&`

```js
class A { 
  name: string;
}

class B { 
  age: number;
}

const person = <A & B> { 
  name: 'Jack',
  age:20
}

```



#### 数据类型:

包含了 js 所有数据类型:布尔值、数值、字符串、null、undefined 以及 ES6 中的新类型 Symbol;

新增类型:

1. 元组 Tuple
   相当于一个已知长度和数据类型的数组

```js
let x: [string, number];
x = ['hello', 10]; // OK
x = [10, 'hello']; // Error
```
2. 数组,规范数组元素的类型
```js 
let list: number[] = [1, 2, 3];
let list: Array<number> = [1, 2, 3];

```


3. 枚举 enum

```js
enum Color {Red, Green, Blue}
let c: Color = Color.Green;
```

默认情况下，从 0 开始为元素编号。 你也可以手动的指定成员的数值。枚举类型提供的一个便利是你可以由枚举的值得到它的名字。

```js
enum Color {Red = 1, Green, Blue}
let colorName: string = Color[2];
console.log(colorName); //'Green'
```

4. any

标识任意类型

5. Void

表示没有任何类型,只能为它赋予 `undefined` 和 `null`

6. never

表示永远不存在的类型.
`never` 类型是任何类型的子类型，也可以赋值给任何类型；然而，没有类型是 `never` 的子类型或可以赋值给 never 类型（除了 `never` 本身之外）。 即使 any 也不可以赋值给 `never`。

```js
// 返回never的函数必须存在无法达到的终点
function error(message: string): never {
  throw new Error(message);
}

// 推断的返回值类型为never
function fail() {
  return error('Something failed');
}

// 返回never的函数必须存在无法达到的终点
function infiniteLoop(): never {
  while (true) {}
}
```

类型别名:
```js
type Name = string;
type NameResolver = () => string;
type NameOrResolver = Name | NameResolver;
function getName(n: NameOrResolver): Name {
    if (typeof n === 'string') {
        return n;
    }
    else {
        return n();
    }
}

```


#### 变量声明/作用域/解构

与 js 标准相同,略过


#### 函数
- 对返回值的数据类型增加了推断
- `this` 参数
`this` 作为参数
1. 能智能提示 普通函数 or 箭头函数中 `this` 的作用
```js
class Handler {
    info: string;
    onClickGood(this: void, e: Event) {
        // can't use this here because it's of type void!
        console.log('clicked!');
    }
}
let h = new Handler();
uiElement.addClickListener(h.onClickGood);
```

2. 在类与继承的过程中,可以更清楚的断言当前类型
```js
interface Card {
    suit: string;
    card: number;
}
interface Deck {
    suits: string[];
    cards: number[];
    createCardPicker(this: Deck): () => Card;
}
let deck: Deck = {
    suits: ["hearts", "spades", "clubs", "diamonds"],
    cards: Array(52),
    // NOTE: The function now explicitly specifies that its callee must be of type Deck
    createCardPicker: function(this: Deck) {
        return () => {
            let pickedCard = Math.floor(Math.random() * 52);
            let pickedSuit = Math.floor(pickedCard / 13);

            return {suit: this.suits[pickedSuit], card: pickedCard % 13};
        }
    }
}

let cardPicker = deck.createCardPicker();
let pickedCard = cardPicker();

alert("card: " + pickedCard.card + " of " + pickedCard.suit);
```

- 重载
在 标准js 的函数使用中, 实参的个数可以是动态的, 而在 ts 中则必须与函数定义时一致, 虽然 ts 调用函数也可传参 null,undefined.
在 ts 中相同的函数名不同的参数(类型或个数) 可视为不同的函数,但与 java 等语言不同的是, ts的重载最终是通过函数体内对参数的判断实现.(js常用的重载方法)
```js 
function pickCard(x: {suit: string; card: number; }[]): number;
function pickCard(x: number): {suit: string; card: number; };
function pickCard(x): any {
    // Check to see if we're working with an object/array
    // if so, they gave us the deck and we'll pick the card
    if (typeof x == "object") {
        let pickedCard = Math.floor(Math.random() * x.length);
        return pickedCard;
    }
    // Otherwise just let them pick the card
    else if (typeof x == "number") {
        let pickedSuit = Math.floor(x / 13);
        return { suit: suits[pickedSuit], card: x % 13 };
    }
}

```
注意，function pickCard(x): any并不是重载列表的一部分，因此这里只有两个重载：一个是接收对象另一个接收数字。 以其它参数调用 pickCard会产生错误。
#### 接口

体用一种抽象的结构的数据类型

```js
interface LabelledValue {
  label: string;
}
```
属性种类可以基本数据类型,也


- 可选属性 `?`

```js
interface SquareConfig {
  color?: string;
  width?: number;
}
```

- 只读属性 `readonly`

```js
interface Point {
    readonly x: number;
    readonly y: number;
}
```

- 作为函数的接口

```js
interface SearchFunc {
  (source: string, subString: string): boolean;
}
let mySearch: SearchFunc;
mySearch = function(src, sub) {
    let result = src.search(sub);
    return result > -1;
}
```

- 可索引的类型
TypeScript支持两种索引签名：字符串和数字。这是因为当使用 number来索引时，JavaScript会将它转换成string然后再去索引对象。 也就是说用 100（一个number）去索引等同于使用"100"（一个string）去索引，因此两者需要保持一致。
```js 
interface StringArray {
  [index: number]: string;
}

let myArray: StringArray;
myArray = ["Bob", "Fred"];

let myStr: string = myArray[0];
```

#### 类

- 属性修饰符

|修饰符   | 作用   |
|--|--|
|public(默认)   | 所有地方都可以使用   |
|private   | 只有类内部可以使用   |
|protected   | 在子类中也可以使用,外部不可访问   |

- getter/setter static  与 es6 相同
- readonly 与接口使用方法相同
- abstract 抽象类


#### 泛型
指当定义 函数,接口,类 时不具体指定数据类型,当其运行时有具体数据类型的推断

```js
function identity<T>(arg: T): T {
    return arg;
}
```
在上例中,传入参数为参数的类型和返回值类型一定相同, 而使用 `any` 则达不到次效果





#### 兼容性
TypeScript结构化类型系统的基本规则是，如果x要兼容y，那么y至少具有与x相同的属性.

1. 类与接口 => 属性相同时则兼容
```js
interface Named {
    name: string;
}

class Person {
    name: string;
}

let p: Named;
// OK, because of structural typing
p = new Person();

```
2. 函数

```js
let x = (a: number) => 0;
let y = (b: number, s: string) => 0;

y = x; // OK
x = y; // Error

```
```js
let x = () => ({name: 'Alice'});
let y = () => ({name: 'Alice', location: 'Seattle'});

x = y; // OK
y = x; // Error, because x() lacks a location property
```
3. 函数参数双向协变
在高阶函数的使用中,实际调用函数传入的参数类型可能比高阶函数定义时的类型准确.   (建议参考文档,略绕).

4. 可选参数及剩余参数
 `...args` 对于不确定参数的情况可兼容

5. 函数重载
对于有重载的函数，源函数的每个重载都要在目标函数上找到对应的函数签名。 这确保了目标函数可以在所有源函数可调用的地方调用。

6. 类 
实例对象比较,静态成员和构造函数不在比较范围内.`protected`和`private` 会影响属性


#### 模块化 => js 各种模块化


#### 声明
`declare`: 以 .d.ts 后缀文件中声明,声明后可在项目其他文件内使用声明的内容

####  命名空间