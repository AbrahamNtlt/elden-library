###

undefind === void 0 // ie8以下

### typeof

特殊数据:
null ->   object

NaN ->   number

document.all ->   undefined

document.all 非标准, 为ie浏览器实现的, 其余浏览器没有该字段,返回 undefined, ie10之前返回 object,
但是之后为了与其他浏览器统一,也改为 undefined

暂时性死区:

```js
function log() {
    typeof a
    let a = 1
}

log()
```

### constructor

constructor 函数, 指向构造构造函数, 可以被改写

### instanceof

多窗口iframe时, 判断不准确

```js
const frame = window.frames[0] // [naive code]
const isInstanceOf = [] instanceof frame.Array // false
```

### isPrototypeOf ???

基本

### Object.prototype.toString.call()

使用自定义类型

```js
class MyObj {
    get [Symbol.toStringTag]() {
        return 'MyObj'
    }
}

const myObj = new MyObj()
console.log(Object.prototype.toString.call(myObj))
```

| 方法                 | 基础类型 | 引用类型 | 特殊事项                     |
|--------------------|------|------|--------------------------|
| typeof             | yes  | no   | NaN, null, document.all  |
| constructor        | yes  | yes  | 属性指向可以被改写                |
| instanceof         | no   | yes  | iframe下, class语法, 右边构造器? |
| isPrototypeOf      | no   | yes  | null 和 undefined         |
| toString           | yes  | yes  | 内置原型可扩展                  |
| Symbol.toStringTag | no   | yes  | 识别自定义对象                  |


