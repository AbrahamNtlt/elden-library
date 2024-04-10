### 模块化

`JavaScript` 最初设计这门语言时只是将它定位成一个小型的脚本语言而并没有制定模块化的规范。因此 `JavaScript` 在很长一段是假也没有模块化的概念。<br>

早期的页面开发引入脚本是通过 `script`标签引入不同的 JS 文件来进行拆分代码。但当代码规模逐渐扩大，此开发模式愈显弊端：

1.  所有模块都在全局作用域中，全局环境受到污染，命名冲突。
2.  模块之间的引用关系不明确，必须人为按需求调整加载顺序。
3.  所有模块文件同步加载，造成页面阻塞。

在这个时期，使用了命名空间和封闭的匿名函数的手段，虽然很大的缓冲了命名冲突和执行顺序的问题，但由于都借助于挂载全局变量，是从代码逻辑的角度处理，实际并没根本解决该问题。

#### CommonJs

现在提 `CommonJs` 通常联想到 `node.js` 实现的模块化标准。事实上两者并不完全一样， `nodejs` 实现了 `CommonJs` 的一部分标准。<br>

`CommonJs` 规定了每个文件为单独的模块，每个模块有自己独有的作用域，作用域内的变量只能模块自身访问。<br>

`CommonJs` 通过 `modules.exports = { ...}` 导出，或者 `exports.xxx = xxx` 以添加属性的方式， 但不能对 `exports` 直接赋值，可以简单的理解为每个模块开头都有一段代码：

```js
var module = {
  exports: {},
};

var exports = module.exports;
```

`CommonJs` 通过 `require()` 加载模块，当模块第一次被加载时，模块代码将被执行，然后导出其结果。当模块再次被加载时则不执行模块代码，直接到处上次执行的结果。

#### AMD

全称为：Asynchronous Module Definition ，专注于浏览器的异步模块定义规范。<br>
代表库 `Require.js`： `define()` 定义模块，`require()` 加载模块。

#### CMD

全称为：Common Module Definition，与 `AMD` 相同都是专注于浏览器的模块化规范，区别在于 `CMD` 是同步阻塞式的加载方式。<br>
代表库: `Sea.js` ，使用上基本与 `Require.js` 相同，且 `Require.js` 通过配置也可以实现同步加载。

#### UMD

全称为： Universal Module Definition，严格讲并不是一个规范，而是一种兼容 `CommonJs` 、`AMD` 、 `CMD` 的一套具体实现：

```js
((root, factory) => {
  if (typeof define === 'function' && define.amd) {
    //AMD
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    //CommonJS
    var $ = requie('jquery');
    module.exports = factory($);
  } else {
    root.testModule = factory(root.jQuery);
  }
})(this, ($) => {});
```

#### ES Modules

`ES Modules` 是 `ES6` 发布后， `JavaScript` 这语言才真正具备的模块化特性。`import` 与 `export` 作为保留关键字，对模块进行导入与导出。(`CommonJs` 的 `module` 并不是关键字)<br>
与 `CommonJs` 相同， `ES Modules` 也是一个文件为一个模块，模块享有单独的作用域。
<br>
在高级浏览器的 `script` 标签中添加 `type="module"` 即可支持 `ES Modules`。
<br>
`ES Modules` 默认打开严格模式。

```js
// calculate.js 导出
export { add };
// calculate.js 导入
import { add } from './calculate.js';
```

`default` 与 `as` 用法相当于变量名。

```js
// calculate.js 导出
const add = function() {};
export default add;
// calculate.js 导入
import def, { default as add } from './calculate.js';

//ps: 此处的 def 与 add  效果等价,但 def 必须写在前面,否则会有异常
```

复合写法:

```js
export { add } from './calculate.js';
//等价于
import { add } from './calculate.js';
export { add };
```

`ES Modules`执行可支持异步，通过 `import()` 将返回一个 `Promise` 对象。

```js
import('./calculate.js').then((add) => {
  add();
});
```

#### ES Modules 与 CommonJs 的区别

`ES Modules` 与 `CommonJs` （指 `node.js` 实现的版本) 为现在前端模块化最常用的两种模式。

1. 静态加载与动态加载
   `CommonJs` 是在运行阶段动态加载，这使得他可以出现在 `if` 这一类条件语句中运行。<br>
   而 `ES Modules` 是在编译阶段的静态加载.这要求他必须在顶层作用域中声明，并且加载路径不可以使用表达式。<br>
   由于 `ES Modules` 加载的是可确定的静态资源，这将有利于代码的检查，排错和优化。<br>

2. 值的拷贝与动态映射
   `CommonJs` 的取值是依赖所导出值的拷贝，是一个全新的数据。

   ```js
   // calculate.js 导出
   var count = 0;
   module.exports = {
     count: count,
     add: function() {
       count++;
     },
   };
   // calculate.js 导入
   var count = require('./calculate.js').count;
   var add = require('./calculate.js').add;

   console.log(count); //0
   add();
   console.log(count); //0 由于是拷贝值所以对当前模块的 count 与 calculate模块的 count 并影响
   count++;
   console.log(count); //1
   ```

   `ES Modules` 导入的是依赖模块原有值的映射：

   ```js
   // calculate.js 导出
   var count = 0;
   var add = function() {
     count++;
   };
   export { count, add };
   // calculate.js 导入
   import { count, add } from './calculate.js';
   console.log(count); //0
   add();
   console.log(count); //1
   count++; //不可改变,  SyntaxError: "count" is read-only
   ```

3. 循环依赖

   在工程项目中，开发人员应尽量避免循环依赖的加载，但由于工程规模的庞大，此类问题则是有可能出现。 <br>
   由于两种规范的加载机制不同，导致了循环引用依赖带来的导出值将不一致。
   <br>
   回顾下 CommonJs 加载机制的特点:

   - 只在首次加载执行代码，再次加载则返回上次执行的结果。
   - 导出结果为值的拷贝。
   - `module.exports` 默认情况下为空对象。

   示例:

   ```js
   //foo.js
   const bar = require('./bar.js');
   console.log('value of bar is : ' + bar);
   module.exports = 'foo';
   //bar.js
   const foo = require('./foo.js');
   console.log('value of foo is : ' + foo);
   module.exports = 'bar';
   // 入口文件  index.js
   require('./foo.js');
   ```

   结果为:

   ```
   value of foo is :  {}
   value of bar is :  bar
   ```

   解析其执行顺序:

   1. `index.js` 执行导入 `foo.js`，主动权交于 `foo.js`。
   2. 执行 `foo.js` 文件脚本。
   3. `foo.js` 执行导入 `bar.js`，主动权交于 `bar.js`。
   4. 执行 `bar.js` 文件脚本。
   5. `bar.js` 执行导入 `foo.js`，此时出现了循环引用，主动权不转交，直接将原先 `foo.js` 的导出值拷贝 。由于 `foo.js` 并没有向下执行完毕，默认导出的为空对象。
   6. `bar.js` 接收空对象执行打印语句 `value of foo is : {}`
   7. `bar.js` 导出结果 `'bar'`，主动权回到 `foo.js`。
   8. `foo.js` 接收 `'bar'`，向下执行语句。

   同样逻辑的代码使用 `ES Modules` 结果为:

   ```
   value of foo is :  undefined
   value of bar is :  bar
   ```

   解析其执行顺序:

   1. `index.js` 执行导入 `foo.js`，主动权交于 `foo.js`,不变。
   2. `foo.js` 静态分析导入 `bar.js`，主动权交于 `bar.js`。
   3. `bar.js` 静态分析导入 `foo.js`，此时出现了循环引用，主动权不转交，直接将指向 `foo.js` 的导出 。由于 `foo.js` 并没有向下执行完毕，没有执行导出动作。
   4. `bar.js` 执行脚本，此时`foo` 变量为 `undefined`。
   5. `bar.js` 执行完毕后，主动权回到 `foo.js`，执行脚本命令，此时 `bar` 的变量取值为 `'bar'`。


#### ES Harmony 

还在建议阶段

```js
module staff{
    export var baker = {
        bake: function( item ){
            console.log( "Woo! I just baked " + item );
        }
    }  
}

module skills{
    export var specialty = "baking";
    export var experience = "5 years";
}

module cakeFactory{
    import baker from staff;
    import * from skills;
    export var oven = {
        makeCupcake: function( toppings ){
            baker.bake( "cupcake", toppings );
        },
        makeMuffin: function( mSize ){
            baker.bake( "muffin", size );
        }
    }
}
```