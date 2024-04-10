### webpack

webpack 是静态资源打包工具。随着现代前端项目变大， webpack 已成为前端工程化的模块管理工具，提升开发效率的利器。

#### 相关概念

| 模块概念 | 含义                                      |
| -------- | ----------------------------------------- |
| module   | 模块，在 webpack 中所有资源都是模块       |
| chunk    | 多个模块的集合组成的代码块                |
| bundle   | 打包输出后的文件，是 chunk 最终输出的结果 |

| 配置概念 | 含义                 |
| -------- | -------------------- |
| entry    | 模块入口             |
| output   | 文件打包后的输出地址 |
| loader   | 模块加载器           |
| plugin   | 扩展插件             |

| 文件缓存    | 含义                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| hash        | 哈希值是一套带上 MD5 的算法，此处指与整个 webpack 构建相关，所有文件同有一个 hash 值，所以不能实现缓存功能                                                   |
| chunkhash   | 与 chunk 对应的哈希值，当分入口或抽取公用代码时，可保证 chunk 的内容不变则不更改 chunkhash                                                                   |
| contenthash | 文件内容所对应的哈希值，当一个模块引入 css 时，通常 css 会使用插件单独分离,如果是同一模块，修改一处都会改变 chunkhash 的值，所以缓存的效果也不如 contenthash |

#### 基本配置

1. entry 入口配置

   与 context 配置一起共同组成模块入口。(context 的作用即确定根路径,使得 entry 的写法更简便,在多入口配置情况下比较明显)
   entry 主要接收三种类型数据， string 类型与 array 类型的相对路径 和 object 类型。

   - 为 string 类型， 只生成一个 chunk， chunk 的名称为 main。
   - 为 array 类型的时候, 也只生成一个 chunk， 搭配 output.library 配置使用时，只有数组最后一个模块将被导出。
   - entry 为 object 类型则生成多个 chunk，每个 chunk 的名称对应 object 的 name，object 的 value 可以是 string 和 array。
   - entry 支持函数，甚至支持异步操作(大部分配置也支持)， 函数执行的结果为 entry 函数的返回值。

2. output
   输出相关的配置

   - filename:打包输出的文件名，string 类型，单入口可以直接写文件名，多入口则必须借助 chunk 的变量。

   | 变量名    | 含义                    |
   | --------- | ----------------------- |
   | id        | 标识符，从 0 开始递增    |
   | name      | chunk 名称              |
   | hash      | webpack 打包 的 hash 值 |
   | chunkhash | chunk 内容的 hash 值    |

   hash 与 chunkhash 可以指定长度: [chunkhash:5]

   - path: string 类型，文件输出的路径与目录。
   - publicPath: string 类型， 静态类型的请求位置。
     1. 相对路径:相对于访问的 `html`
     ```
     假设当前html的地址为  http:web.com/app/index.html
     publicPath:'./' => http:web.com/app/main.js
     publicPath:'./js/' => http:web.com/app/js/main.js
     publicPath:'../assets/' => http:web.com/assets/main.js
     ```
     2. 绝对路径: 基于 host。
     ```
     假设当前html的地址为  http:web.com/app/index.html
     publicPath:'/' => http:web.com/app/main.js
     publicPath:'/js/' => http:web.com/js/main.js
     ```
     3. CDN 地址:
     ```
     publicPath:'//cdn.com' => //cdn.com/main.js
     ```

3. mode 工作模式
   webpack 4 对各种配置增加了默认值，mode 定义了 development 与 production 两种常用的场景配置，各模式下相应的启动不同的插件或插件的配置。


#### webpack 输出结果分析

先以开发模式为例

最外层结构是一个立即执行 的匿名函数 称之为 webpack 的 `启动函数` ，而打包后的代码则作为参数执行。

```js
(function(modules) {
  // webpackBootstrap
  // 此处省略内部固定的一些函数定义,函数最后执行入口文件并返回入口 export 内容
  return __webpack_require__((__webpack_require__.s = './src/index.js'));
})({
  //输出的数据结构根据配置会有所不同,此处为 key-value 也可能是数组
  './src/index.js': function(module, __webpack_exports__, __webpack_require__) {
    eval('//index.js code');
  },
});
```

webpackBootstrap 内部函数分析

```js
//函数内部 map 结构的 模块缓存
var installedModules = {};
// __webpack_require__ 引入模块函数
function __webpack_require__(moduleId) {
  // 1. 先查看moduleId是否在缓存中,若在缓存中直接返回结果
  if (installedModules[moduleId]) {
    return installedModules[moduleId].exports;
  }
  // 2. 若不在缓存中则创造一个新模块
  var module = (installedModules[moduleId] = {
    i: moduleId, //模块id
    l: false, //模块是否被加载标识
    exports: {}, //模块的导出
  });

  // 此处执行模块内容
  modules[moduleId].call(
    module.exports,
    module,
    module.exports,
    __webpack_require__
  );

  // 标记模块已加载
  module.l = true;

  // 返回模块的导出内容
  return module.exports;
}
```

其余 `__webpack_require__` 上的标识:

```js
//所有模块  即启动函数的参数
__webpack_require__.m = modules;
```

```js
//缓存 cache
__webpack_require__.c = installedModules;
```

```js
// 判断是否存在私有属性
__webpack_require__.o = function(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
};
```

```js
// 对 exports 定义属性 getter
__webpack_require__.d = function(exports, name, getter) {
  if (!__webpack_require__.o(exports, name)) {
    Object.defineProperty(exports, name, { enumerable: true, get: getter });
  }
};
```

```js
// 对 exports 定义 '__esModule' 属性
__webpack_require__.r = function(exports) {
  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
  }
  Object.defineProperty(exports, '__esModule', { value: true });
};
```

```js
//创建一个假的命名空间对象
__webpack_require__.t = function(value, mode) {
  if (mode & 1) value = __webpack_require__(value);
  if (mode & 8) return value;
  if (mode & 4 && typeof value === 'object' && value && value.__esModule)
    return value;
  var ns = Object.create(null);
  __webpack_require__.r(ns);
  Object.defineProperty(ns, 'default', { enumerable: true, value: value });
  if (mode & 2 && typeof value != 'string')
    for (var key in value)
      __webpack_require__.d(
        ns,
        key,
        function(key) {
          return value[key];
        }.bind(null, key)
      );
  return ns;
};
```

```js
//兼容 export default
__webpack_require__.n = function(module) {
  var getter =
    module && module.__esModule
      ? function getDefault() {
          return module['default'];
        }
      : function getModuleExports() {
          return module;
        };
  __webpack_require__.d(getter, 'a', getter);
  return getter;
};
```

```js
//标记 publicPath 配置
__webpack_require__.p = '';
```

现假设打包前代码为:

```js
//index.js
import { add } from './sync.js';
add(1, 1);
//sync.js
const add = (a, b) => {
  return a + b;
};
export { add };
```

将打包结果的格式化可得:

```js
{
  "./src/index.js":(function(module, __webpack_exports__, __webpack_require__) {
    __webpack_require__.r(__webpack_exports__);
    var _sync_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/sync.js");
    Object(_sync_js__WEBPACK_IMPORTED_MODULE_0__["add"])(1,1));
  }),
  "./src/sync.js":(function(module, __webpack_exports__, __webpack_require__) {
    __webpack_require__.r(__webpack_exports__);
    __webpack_require__.d(__webpack_exports__, "add", function() { return add; });
    const add = (a , b)=>{  return a + b});
}
```

执行分析:

1. 执行 bootstrap 中的 `__webpack_require__(__webpack_require__.s = "./src/index.js")`;
2. `__webpack_require__` 内部查询不到缓存,新建一个 `module`,此时:

   ```js
   //module 为
   {
     i:'./src/index.js',
     l: false,
     exports:{}
   }

   // modules[moduleId] 为
   function(module, __webpack_exports__, __webpack_require__) {
     __webpack_require__.r(__webpack_exports__);
     var _sync_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/sync.js");
     Object(_sync_js__WEBPACK_IMPORTED_MODULE_0__["add"])(1,1));
   }
   // module.exports 为上下文,相应的形参依次传入:
   modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
   ```

3. 执行 `index.js` 中的 `__webpack_require__("./src/sync.js")`，依旧没有在缓存中查找到结果,创建新 `module`。
4. 在 `sync.js` 中的 `module.exports` 增加 `add` 属性，取值为 `function() { return add; }`。
5. `sync.js`的 `module.l` 标记为 `true`，以便下次直接调取, 返回其执行结果 `module.exports`。
6. `index.js` 中的 `_sync_js__WEBPACK_IMPORTED_MODULE_0__` 接收 `sync.js` 中的 `module.exports`，即依赖模块所封装的对象。
7. 继续执行 `index.js` 脚本后,标记 `module.l` 并导出结果， 完成启动函数。

生产模式:

```js
!(function(e) {
  var t = {};
  function r(n) {
    if (t[n]) return t[n].exports;
    var o = (t[n] = { i: n, l: !1, exports: {} });
    return e[n].call(o.exports, o, o.exports, r), (o.l = !0), o.exports;
  }
  (r.m = e),
    (r.c = t),
    (r.d = function(e, t, n) {
      r.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: n });
    }),
    //...相同的各种函数定义
    r((r.s = 0));
})([
  function(e, t, r) {
    'use strict';
    r.r(t);
  },
]);
```

生产模式下做了更多的优化，比如代码压缩、函数变量转移、使用 treesharking 将多余代码删除。
如上，启动函数的原理并没有变化，只是作为参数的模块变为了数组形式，且经过分析 `index.js` 没有导出结果也没有任何视图相关变化，打包后经过优化直接删除模块内部函数与其先关依赖。

动态导入的处理:

启动函数增加内容:

```js
// jsonp 获取数据后回调函数
function webpackJsonpCallback(data) {
  var chunkIds = data[0];
  var moreModules = data[1];

  var moduleId,
    chunkId,
    i = 0,
    resolves = [];
  for (; i < chunkIds.length; i++) {
    chunkId = chunkIds[i];
    if (
      Object.prototype.hasOwnProperty.call(installedChunks, chunkId) &&
      installedChunks[chunkId]
    ) {
      resolves.push(installedChunks[chunkId][0]);
    }
    installedChunks[chunkId] = 0;
  }
  for (moduleId in moreModules) {
    if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
      modules[moduleId] = moreModules[moduleId];
    }
  }
  if (parentJsonpFunction) parentJsonpFunction(data);

  while (resolves.length) {
    resolves.shift()();
  }
}
// chunkId 与 动态加载文件的映射
var installedChunks = {
  main: 0,
};
//根据 chunkId 获取 jsonp 地址
function jsonpScriptSrc(chunkId) {
  return __webpack_require__.p + '' + ({}[chunkId] || chunkId) + '.js';
}
__webpack_require__.e = function requireEnsure(chunkId) {
  // 设置一个列队,处理动态加载的依赖模块
  var promises = [];
  var installedChunkData = installedChunks[chunkId];
  if (installedChunkData !== 0) {
    if (installedChunkData) {
      promises.push(installedChunkData[2]);
    } else {
      // setup Promise in chunk cache
      var promise = new Promise(function(resolve, reject) {
        installedChunkData = installedChunks[chunkId] = [resolve, reject];
      });
      promises.push((installedChunkData[2] = promise));

      // 创建 script 标签
      var script = document.createElement('script');
      var onScriptComplete;

      script.charset = 'utf-8';
      script.timeout = 120;
      if (__webpack_require__.nc) {
        script.setAttribute('nonce', __webpack_require__.nc);
      }
      script.src = jsonpScriptSrc(chunkId);

      var error = new Error();
      onScriptComplete = function(event) {
        script.onerror = script.onload = null;
        clearTimeout(timeout);
        var chunk = installedChunks[chunkId];
        if (chunk !== 0) {
          if (chunk) {
            var errorType =
              event && (event.type === 'load' ? 'missing' : event.type);
            var realSrc = event && event.target && event.target.src;
            error.message =
              'Loading chunk ' +
              chunkId +
              ' failed.\n(' +
              errorType +
              ': ' +
              realSrc +
              ')';
            error.name = 'ChunkLoadError';
            error.type = errorType;
            error.request = realSrc;
            chunk[1](error);
          }
          installedChunks[chunkId] = undefined;
        }
      };
      var timeout = setTimeout(function() {
        onScriptComplete({ type: 'timeout', target: script });
      }, 120000);
      script.onerror = script.onload = onScriptComplete;
      document.head.appendChild(script);
    }
  }
  //最后返回的是当前处理的 promises队列 的 promise 对象
  return Promise.all(promises);
};
__webpack_require__.oe = function(err) {
  console.error(err);
  throw err;
};

var jsonpArray = (window['webpackJsonp'] = window['webpackJsonp'] || []);
var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
jsonpArray.push = webpackJsonpCallback;
jsonpArray = jsonpArray.slice();
for (var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
var parentJsonpFunction = oldJsonpFunction;
```

动态导入的文件结构

```js
  // main.js 打包后的执行函数
  __webpack_require__.e(0)
  .then(__webpack_require__.bind(null,"./src/async.js"))
  .then(data)=>{ //.... })
  }
  // 动态文件 async.js 打包后的 0.js
  (window['webpackJsonp'] = window['webpackJsonp'] || []).push([
    [0],
    {
      './src/async.js': function (
        module,
        __webpack_exports__,
        __webpack_require__
      ) {
        __webpack_require__.r(__webpack_exports__);
        __webpack_require__.d(__webpack_exports__, 'add', function () {
          return add;
        });
        const add = (a, b) => {
          return a + b;
        };
      },
    },
  ]);
```

动态加载模块的文件将单独打包成 bundle,分析动态加载过程:

1. `main.js` 的入口函数执行过程中执行了 `__webpack_require__.e(0)`。
2. `__webpack_require__.e` 开始导入异步资源， `window['webpackJsonp']`作为缓存,对加载过的模块标记为 0(打包时已做判断)。
3. 首次加载异步模块,创建 chunk 队列，创建 script 标签,异常处理等。
4. 文档中插入 script 标签,加载 0.js 内容并执行。
5. 此时的 `window['webpackJsonp'].push` 已经改为了 `webpackJsonpCallback`。(webpackJsonp 存在变量名冲突的全局环境污染的风险)
6. `webpackJsonpCallback` 函数内部也有一套 `installedChunks` 缓存机制, 并把异步模块添加到 `modules` 中。
7. `parentJsonpFunction(data)` 是执行启动函数中所替换了的 `jsonpArray.push.bind(jsonpArray)`的`push`，等于是添加到`window['webpackJsonp']`中。
8. `resolves` 队列中执行 `webpackJsonpCallback` 中的 `promise` 至结束。
