### 概览

基础数据 / 转换
首先要介绍ToPrimitive方法，这是 JavaScript 中每个值隐含的自带的方法，用来将值 （无论是基本类型值还是对象）转换为基本类型值。如果值为基本类型，则直接返回值本身；如果值为对象，其看起来大概是这样：

/**
* @obj 需要转换的对象
* @type 期望的结果类型
*/
ToPrimitive(obj,type)
type的值为number或者string。

当type为number时规则如下：

调用obj的valueOf方法，如果为原始值，则返回，否则下一步；
调用obj的toString方法，后续同上；
抛出TypeError 异常。
当type为string时规则如下：

调用obj的toString方法，如果为原始值，则返回，否则下一步；
调用obj的valueOf方法，后续同上；
抛出TypeError 异常。
可以看出两者的主要区别在于调用toString和valueOf的先后顺序。默认情况下：

如果对象为 Date 对象，则type默认为string；
其他情况下，type默认为number。
而 JavaScript 中的隐式类型转换主要发生在+、-、*、/以及==、>、<这些运算符之间。而这些运算符只能操作基本类型值，所以在进行这些运算前的第一步就是将两边的值用ToPrimitive转换成基本类型，再进行操作。

以下是基本类型的值在不同操作符的情况下隐式转换的规则 （对于对象，其会被ToPrimitive转换成基本类型，所以最终还是要应用基本类型转换规则）：

+操作符
当+操作符的两边有至少一个string类型变量时，两边的变量都会被隐式转换为字符串；其他情况下两边的变量都会被转换为数字。
 1 + '23' // '123'
 1 + false // 1 
 1 + Symbol() // Uncaught TypeError: Cannot convert a Symbol value to a number
 '1' + false // '1false'
 false + true // 1
-、*、\操作符
这三个操作符是为数字操作而设计的，所以操作符两边的变量都会被转换成数字，注意NaN也是一个数字
 1 * '23' // 23
 1 * false // 0
 1 / 'aa' // NaN
对于==操作符
操作符两边的值都尽量转成number：

3 == true // false, 3 转为number为3，true转为number为1
'0' == false //true, '0'转为number为0，false转为number为0
'0' == 0 // '0'转为number为0
对于<和>比较符
如果两边都是字符串，则比较字母表顺序：

'ca' < 'bd' // false
'a' < 'b' // true
其他情况下，转换为数字再比较：

'12' < 13 // true
false > -1 // true
以上说的是基本类型的隐式转换，而对象会被ToPrimitive转换为基本类型再进行转换：

var a = {}
a > 2 // false
其对比过程如下：

a.valueOf() // {}, 上面提到过，ToPrimitive默认type为number，所以先valueOf，结果还是个对象，下一步
a.toString() // "[object Object]"，现在是一个字符串了
Number(a.toString()) // NaN，根据上面 < 和 > 操作符的规则，要转换成数字
NaN > 2 //false，得出比较结果
又比如：

var a = {name:'Jack'}
var b = {age: 18}
a + b // "[object Object][object Object]"
运算过程如下：

a.valueOf() // {}，上面提到过，ToPrimitive默认type为number，所以先valueOf，结果还是个对象，下一步
a.toString() // "[object Object]"

b.valueOf() // 同理
b.toString() // "[object Object]"

a + b // "[object Object][object Object]"



函数定义 调用
IIFE


作用域 /上下文 / 闭包 
需要特别解释一下变量  标识符的概念
词法作用域
https://blog.csdn.net/nazeniwaresakini/article/details/104220134
https://www.zhihu.com/question/34499262


原型链和继承

异步函数

正则表达式


eventloop
分nodejs 和浏览器



集合类

你认为 JavaScript 是一门解释型语言还是编译型语言？
答案：

先来看一下解释型语言和编译型语言的区别：

编译型语言，如 Java，编译器在代码运行前将其从编程语言转换成机器语言，所以编译后的文件可以直接运行
解释型语言，编译器在运行时将代码从编程语言转换成机器语言，所以运行环境中要安装解释器
所以 JavaScript 算是一门解释型语言， 因为 JavaScript 代码需要在机器（node 或者浏览器）上安装一个工具（ JS 引擎）才能执行。这是解释型语言需要的。而编译型语言产品能够自由地直接运行。

但是同时 JavaScript 又带有一个编译型语言的特性。编译型语言的优点是它有足够的时间在运行之前被编译，在编译的同时做足够的词法分析、极致的优化工作。但是解释型语言要在执行后一瞬间就开始，JavaScript 引擎没有时间做优化。比如：

for(i=0; i<1000; i++){
    sum += i;
}
在编译型语言中，循环体内的部分在运行时早已被编译器编译成机器码，所以直接运行 1000 次就好。

而在解释型语言中，JavaScript 引擎不得不对循环体内相同的代码解释 1000 次，这会造成很大的性能浪费。所以 Google 和 Mozilla 的开发者给 JavaScript 引擎加上了 JIT (即时编译)的功能。

在代码运行之前，会先放在 JIT 中进行编译，它具体这样编译：

如果同一段代码运行超过一次，就成为 warm，如果一个函数开始 warm，JIT 就把这段代码缓存起来，下一次就可以不用解释这一段代码。如果代码被重复使用的次数越来越多，也就是变得 hot 或者 hotter，JIT 会进行更多优化并缓存。

综上所述，JavaScript 是一门解释型语言，但是现代 JavaScript 引擎赋予了它一些编译型语言的特性。

解读：

其实编译型语言和解释型语言并没有被分得那么清楚，编译和解释只是优化的手段而已。编译型语言的缺点是移植性和适应性差，虽然执行效率高，但编译时间太长，严重影响开发效率和开发体验。











