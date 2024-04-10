### 数据类型

> 在 JavaScript 运行时，每一个值都属于某一种数据类型。最新的 es 标准中，JavaScript 有 7 中数据类型。

- undefined
  > 表示未定义，`undefined` 作为系统的全局变量时，类型为 `undefined`，值为 `undefined`，值不可修改。
  > PS：另外两个固定值的系统全局变量为`Infinity`、`NaN`。
- null
  > 表示为空，值为 `null` ，类型为 `null`，是一个关键字。
- boolean
  > 表示逻辑上的真与假，`true` 和 `false` ，关键字。
- string
  > 表示文本数据
  >
  > string 的最大长度为 2^53 - 1， 此长度并非字符数，而是 `UTF16` 编码小的长度。所以，字符串的最大长度，实际上是受字符串的编码长度影响的。
- number
  > 表示数字
  >
  > - 0 存在 +0 和 -0 。
  > - NaN 、 Infinity 和 -Infinity 分别表示不是数字、无穷大、负无穷大。
  > - 非整数的 number 类型无法用 == 来对比。
- symbol
  > `es6` 标准新增的基本类型，仅能用 `Symbol()` 函数创建实例，每个 `symbol`类型的数据都是唯一的。
  >
  > 场景：枚举，对象的非字符串属性`key`。
- object
  > `object` 为 引用类型，其余皆为基本类型。
  > `object` 是属性的集合，每个属性都是 `key-value` 结构。`key` 为 `string` 或 `symbol` 类型。 根据`value`的不同 ，属性分为 `数值属性` 和 `访问器属性` 。

#### typeof

`typeof` 关键字可返回数据的类型，除以上几种基本类型外，还存在特殊的 `function` 类型 。

PS：

- `null` 类型数据返回为 `object`, 运行时类型为 `Null`。
- 函数的 `typeof` 值为 `function`, 运行时类型为 `Object`

#### 封箱与拆箱

`Number` 、`String` 、 `Boolean` 和 `Symbol` 可以产生相应基础类型数据。<br>

`Number` 、`String` 、 `Boolean` 与 `new` 运算符一起时当成构造器使用，返回的是一个 `object` 类型数据，当函数使用时返回对应类型数据。<br>

`Symbol` 不可搭配 `new` 一起使用 ， 但仍作为构造器返回 `symbol` 类型数据。<br>

封箱赋予了基本类型数据使用方法的能力：当一个基础数据类型使用方法时 ，对应的构造类将创建一个实例，在实例上使用指定方法，最后将实例销毁。

`Number` 、`String` 、 `Boolean` 和 `Symbol` 都有特定的原型 `valueOf` 方法方法。<br>

以上类构造出的对象通过`valueOf()` 返回基本类型的原始值，此过程称为拆箱。

#### 隐式转换

JS 是弱类型语言，当数据与一些运算符搭配使用的时候，数据将自动进行数据类型转换。

|         | null      | undefined   | ture   | false   | number                     | string                 | symbol    | object |
| ------- | --------- | ----------- | ------ | ------- | -------------------------- | ---------------------- | --------- | ------ |
| boolean | false     | false       | -      | -       | 0/NAN 为 false 其余为 true | ""为 false 其余为 true | true      | true   |
| number  | 0         | NAN         | 1      | 0       | -                          | StringToNumber         | typeError | 拆箱   |
| string  | "null"    | "undefined" | "true" | "false" | NumberToString             | -                      | typeError | 拆箱   |
| object  | typeError | typeError   | 装箱   | 装箱    | 装箱                       | 装箱                   | 装箱      | -      |


PS：`String` 和 `Number` 类型的数据转换时遵循先拆箱后转换的原则。