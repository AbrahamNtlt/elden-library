# 元组

### 类型化数组

__元组（Tuple)__ 是一个类型化数组，每个索引都有预定义的长度和类型。

```js
let tuple: [number, string]

// 正确赋值
tuple = [1, '2']

// 赋值类型错误
tuple = [1, 2]
```

### 数据越界

```js
tuple[3] = 'world'; // OK, 字符串可以赋值给(string | number)类型

console.log(tuple[4].toString()); // OK, 'string' 和 'number' 都有 toString

tuple[6] = true; // Error, 布尔不是(string | number)类型
```

### 只读元组

```js
// 定义只读元组
const readonlyTuple: readonly [number, string] = [1,  '2']

// 抛出错误，因为它是只读的。
readonlyTuple.push(1) // type error
```

### 解构元组

```js
const tuple: [number, number] = [1, 2]
const [x, y] = tuple // 等同于正常的数组
```

### 命名元组

```js
const tuple: [x: number, y: number] = [1, 2]
tuple.['x'] // 1
tuple.['y'] // 2
```
