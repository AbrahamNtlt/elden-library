### rem单位转换为px

```js
const transform = (str, baseRem) => {
  const reg = /((-?\.?\d+)(\.\d+)?)rem/g;
  return str.replace(reg, function(match, pos, orginText) {
    const val = (parseFloat(pos) * baseRem).toFixed(2)
    return `${val}px`
  })
}
```

- str 为替换前代码
- baseRem 转换比例, 具体还原参照各自项目中的 postcss 的比例配置

```css
// 示例, 转换前
.demo {
  with: 20rem;
  margin: -1rem .1rem -0.5rem 1.5rem
}
```

```css
// 比例设为37.5, 转换后
.demo {
  with: 750.00px;
  margin: -37.50px 3.75px -18.75px 56.25px
}
```
