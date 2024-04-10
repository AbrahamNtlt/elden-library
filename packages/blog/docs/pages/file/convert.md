# 文件数据转换

## Blob URL (Object URL)

是前缀为 `blob:`的 URL， 用来表示关联的`Blob`对象，这个 URL 的生命周期和创建它的窗口的 document 绑定。

```js
const blobUrl = URL.createObjectURL(blob);
```

可在浏览器地址栏、`img`标签`src`、`iframe`标签`src`、`a`标签`href`中使用，并展示相应的文件内容视图。常配合`a`标签`download`属性实现文件下载。

## Base64
 `base64` 是一种基于64个可打印字符来表示二进制数据的方法。
### 优点
 - 方便数据的传输和读写。

### 方法
 - `atob`: 解码一个 Base64 字符串。
 - `btoa`: 将一个字符串或者二进制数据编码一个 Base64 字符串。
 ```js
  btoa("JavaScript")       // 'SmF2YVNjcmlwdA=='
  atob('SmF2YVNjcmlwdA==') // 'JavaScript'
 ``` 

 ## Data URL

是前缀为 `data:[MIME type];base64,`的 URL， 将文件内容转换为 `base64` 字符串存储于 `URL` 中。

可在浏览器地址栏、`img`标签`src`、`iframe`标签`src`、`a`标签`href`、`css` 的 `background-image-url` 中使用，并展示相应的文件内容视图。

### 缺点
  - `base64`编码的体积通常为原数据体积的4/3。
  - `DataURL`的图片不会被浏览器缓存，意味每次访问都被下载一次。
  - `DataURL`在渲染时比不使用多消耗53%左右的CPU资源，内存多出4倍左右，耗时平均高出24.6倍[^1]。

## Image对象相关使用

```js
const img = new Image()
img.src = blobURL | dataURL
img.onload = handleOnload
```

## canvas相关方法

- `drawImage`: 可传入 `Image`对象并绘制。
- `putImageData`: 传入 `ImageData`对象并绘制。
- `getImageData`: 图像数据化，返回`ImageData`对象。
- `toDataURL`: 图像数据化，返回`DataURL`字符串。
- `toBlob`: 图像数据化，返回`Blob`对象。

## 数据转换

### ArrayBuffer → Blob

```js
const blob = new Blob([new Uint8Array(buffer, byteOffset, length)]);
```
### ArrayBuffer → base64

```js
const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
```
### base64 → Blob

```js
const base64toBlob = (base64Data, contentType, sliceSize) => {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}
```
### Blob → ArrayBuffer

```js
function blobToArrayBuffer(blob) { 
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject;
      reader.readAsArrayBuffer(blob);
  });
}
```

### Blob → base64
```js
function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
```
### Blob → Object URL
```js
const objectUrl = URL.createObjectURL(blob);
```



### Blob → File

```js
const file = new File([blob], "filename.png", {type: "image/png",});
```

### File → Blob

```js
const blob = new Blob([file],{type:'image/png'})
```


