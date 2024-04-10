# NaN 和 Number.NaN


typeof NaN -> number




NaN === NaN  不能自都能 

不可删除,配置



isNaN: 检查 toNumber ,返回 true / false

```js
const isNaN = function (val) {
    return Object.is(Number(val),NaN)
}
```

```js
const arr = [NaN]
arr.indexOf(NaN) // -1
arr.includes(NaN) // true
```
