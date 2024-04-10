# 文件操作相关对象和API

## ArrayBuffer

为了满足 JavaScript 与显卡之间大量的、实时的数据交换，它们之间的数据通信必须是二进制的，而不能是传统的文本格式。文本格式传递一个 32 位整数，两端的 JavaScript 脚本与显卡都要进行格式转化，将非常耗时。这时要是存在一种机制，可以像 C 语言那样，直接操作字节，将 4 个字节的 32 位整数，以二进制形式原封不动地送入显卡，脚本的性能就会大幅提升。

ArrayBuffer 代表内存之中的一段二进制数据，可以通过“视图”进行操作。“视图”部署了数组接口，这意味着，可以用数组的方法操作内存。它不能直接读写，只能通过视图（`TypedArray`视图和`DataView`视图）来读写，视图的作用是以指定格式解读二进制数据。

二进制数据相关操作在实际应用开发中发挥重要作用(`file`、`fetch`、`xmlHttpRequest`、`canvas`、`webSocket`)，但又常常被前端工程师所忽视。详细可查看[《ECMAScript 6 入门 ArrayBuffer》](https://es6.ruanyifeng.com/#docs/arraybuffer)。


## Blob

Blob 对象表示一个二进制文件的数据内容，通常用来读写文件。

```js
const blob = new Blob(array [, options]);
```
### 参数：
  - `array`: 可以是一个由 ArrayBuffer , ArrayBufferView , Blob , DOMString 等对象构成的 Array，表示新生成的 Blob 实例对象的内容。
  - `options`:
    - `type`: 指定类型。
    - `endings`: 内容结尾的换行符是否需要适配宿主系统。

### 属性:
  - `size`: 文件的大小，单位为字节。
  - `type`: 文件的类型。

### 方法:
  - `slice`: 用法与 `Array` 的 `slice` 相同，常用于数据分片。
```js
const newBlob = oldBlob.slice([start [, end [, contentType]]])
```

## File 与 FileList

文件对象，继承于 `Blob`，并且可以用在任意的  `Blob` 对象的 context 中(如 `FileReader`，`URL.createObjectURL()`)。`FileList` 为成员为 `File` 的类数组。

```js
const file = new File(array, name[, options]);
```
### 参数：
  - `array`: 与 `Bolb` 构造器的第一个参数相同。
  - `name`: 文件名或文件路径。
  - `options`:
    - `type`: 指定类型。
    - `lastModified`: 最后修改时间(时间戳)。

### 属性:
  - `name`: 文件名。
  - `type`: 指定类型
  - `size`: 文件大小（单位字节）
  - `lastModified`: 最后修改时间。

## FileReader

用于web应用读取 `File` 或 `Blob` 对象的操作API对象。

### 属性:
  - `readyState`: 当前读取状态。
    - 0: 为加载。
    - 1: 加载中。
    - 2: 加载完成。
  - `result`: 读取完成后文件的内容。
  - `error`: 读取文件时发生的错误。

### 事件:
  - `onloadstart`: 读取操作开始。
  - `onabort`: 读取操作被中断。
  - `onprogress`: 读取`Blob`。
  - `onloadend`: 读取操作结束。
  - `onload`: 读取操作完成。
  - `onerror`: 读取操作发生错误。

### 方法:
  - `abort`: 终止读取操作。
  - `readAsArrayBuffer`: 读取完成后返回一个 `ArrayBuffer` 实例。
  - `readAsBinaryString`: 读取完成后返回二进制字符串。
  - `readAsText`: 读取完成后返回文本字符串。
  - `readAsDataURL`: 读取完成后返回 `base64` 的 `DataURL`。

## 文件对象关系图

 <img :src="$withBase('/images/fileObject.png')" alt="dock">
