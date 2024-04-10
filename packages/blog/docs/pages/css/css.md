### CSS

Cascading Style Sheets

#### @规则

由一个 @ 加一个区块或者一个语句组成

```css
/* 设置字符集,写在最前 */
@charset "utf-8";

/* 导入文件 */
@import 'mystyle.css';

/* 媒体查询 */
@media screen and (max-width: 300px) {
  body {
    background-color: lightblue;
  }
}
/* 定义字体 */
@font-face {
  font-family: myfont;
  src: url(...);
}

/* 定义动画 */
@keyframes move {
  from {
    left: 0;
    top: 0;
  }
  to {
    left: 100px;
    top: 100px;
  }
}
/* xml 命名空间 */
@namespace svg url(http://www.w3.org/2000/svg);
svg|a {}
```

#### 选择器

选择器可选 html 上的 tag 和 伪元素，其余如 video 标签内部按钮、ol 的数字 都是不可选中的。

- 所有选择器

```css
  *
```

- 标签选择器、id 选择器、类选择器、属性选择器

```css
  p #id .class [name="attr"]
```

- 伪类选择器、伪元素选择器

```css
  :hover: after;
```

- 逻辑选择器

```css
  :last-child: not(...);
```

- 组合选择器

```
  空格      后代选择器
  >        子代选择器
  ~        节点前的兄弟选择器
  +        节点后的兄弟选择器
  ,        选择器A与选择器B的集合
```
组合选择器的语法运算规则:
1. 无连接符
2. 空格、>、~、+  连接符
3. , 连接符

#### 权重
- 权重决定了哪一条规则会被浏览器应用在元素上，如果两个选择器作用在同一元素上，则权重高者生效。
- 权重的级别根据选择器被划分为四个分类：行内样式，id，类与属性，以及元素。
- 通配符选择器跟继承来的样式，权重值按 0 计算。
- 两个选择器权重值相同，后定义的规则将算入权重中。
- !important 为最高权重值。

#### 值类型

#### 长度单位

#### css 中的函数

calc()max()min()clamp()toggle()attr()



