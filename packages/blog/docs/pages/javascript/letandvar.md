# `var` ， `let` ， `const` 区别

## 1. 作用域

`let` 与 `const` 存在块级作用域， `var` 不存在块级作用域
```js
for(var i = 0 ;i<5;i++) {
  setTimeout(()=> {
    console.log(i)
  })
}
// 输出 5, 5, 5, 5, 5 

for(let i = 0 ;i<10;i++) {
  setTimeout(()=> {
    console.log(i)
  })
}
// 输出 0, 1, 2, 3, 4 
```

## 2. 重复声明
同一作用域下，`var` 允许重复声明，`let` 与 `const` 不允许
```js
var a = 1
var a = 2
let a = 3 // SyntaxError: Identifier 'a' has already been declared
```

## 3. 变量提升与暂时性死区
var 变量的声明会提升至当前作用域顶端
```js
console.log(a) // undefined
var a = 1

// 以上声明等价于
var a;
console.log(a) // undefined
a = 1
```
let 与 const 声明会放在TDZ（temporal dead zone）即暂时性死区中，只有完成执行TDZ中的变量才会将其移出,在此之前访问变量会抛出错误.

```js
console.log(typeof a)  // undefined
// 未定义的变量使用 typeof 访问并不会抛出错误
```

```js
console.log(typeof a) // ReferenceError: Cannot access 'a' before initialization
let a = 1
```

## 4. `var` 会覆盖 `window` 对象上的属性
```js
var a = 1
let b = 2
const c = 3
window.a // 1
window.b // undefined
window.c // undefined
```

## 5. `const` 声明必须初始化，且值不可改变
```js
const a // SyntaxError: Missing initializer in const declaration
```
```js
const a = 1
a = 2  // TypeError: Assignment to constant variable.
```
