#### 水平居中

1. inline-block + text-align
   > 原理:子节点设置为内联元素 ，父节点设置文本居中
   > 缺点:不能同时处理多个子节点的不同对齐

::: demo

 <div id="parent1-1">
    <div id="child1-1">水平居中</div>
  </div>
  <style>
    #parent1-1 {
      width: 100%;
      height: 200px;
      background: #ccc;
      text-align: center;
    }
    #child1-1 {
      width: 200px;
      height: 200px;
      background: #c9394a;
      display: inline-block;
      text-align: left;
    }
  </style>
:::

2. margin:auto

> 原理:利用 margin 属性的自适应
> 优点:只需改变子节点自身的属性
> 缺点:必须是块级元素 ，对于父子节点均不定宽度的情况不适用

::: demo

  <div id="parent1-2">
    <div id="child1-2">水平居中</div>
  </div>
  <style>
    #parent1-2 {
      width: 100%;
      height: 200px;
      background: #ccc;
    }
    #child1-2 {
      width: 200px;
      height: 200px;
      background: #c9394a;
      display: table;
      margin: 0 auto;
    }
  </style>
:::

3. position:absolute + transform
   > 原理:绝对定位向下偏移 50% ，子节点反方向偏移自身 50%
   > 缺点:css3 新特性 ，父节点必须开启定位

::: demo

<div id="parent1-3">
  <div id="child1-3">水平居中</div>
</div>
<style>
#parent1-3 {
  width: 100%;
  height: 200px;
  background: #ccc;
  position: relative;
}
#child1-3 {
  width: 200px;
  height: 200px;
  background: #c9394a;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
</style>
:::

#### 垂直居中

1. table-cell
   > 原理:利用 table-cell 的 vertical-align [vertical-align 生效参考](https://www.zhangxinxu.com/wordpress/2010/05/%E6%88%91%E5%AF%B9css-vertical-align%E7%9A%84%E4%B8%80%E4%BA%9B%E7%90%86%E8%A7%A3%E4%B8%8E%E8%AE%A4%E8%AF%86%EF%BC%88%E4%B8%80%EF%BC%89/)
   > 缺点:改变了父元素的属性

::: demo

  <div id="parent2-1">
    <div id="child2-1">垂直居中</div>
  </div>
  <style>
    #parent2-1 {
      width: 100%;
      height: 300px;
      background: #ccc;
      display: table-cell;
      vertical-align: middle;
    }
    #child2-1 {
      width: 400px;
      height: 100px;
      background: #c9394a;
    }
  </style>
:::

2. position:absolute + transform

   > 与水平居中同理

::: demo

<div id="parent2-2">
  <div id="child2-2">垂直居中</div>
</div>
<style>
  #parent2-2 {
    width: 100%;
    height: 200px;
    background: #ccc;
    position: relative;
  }
  #child2-2 {
    width: 100px;
    height: 100px;
    background: #c9394a;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
</style>
   :::

#### 完全居中

1. 整合 table-cell 的水平和垂直居中

::: demo

<div id="parent3-1">
  <div id="child3-1">居中布局</div>
</div>
<style>
  #parent3-1 {
    width: 200px;
    height: 200px;
    background: #ccc;
    display: table-cell;
    vertical-align: middle;
  }
  #child3-1 {
    width: 100px;
    height: 100px;
    background: #c9394a;
    display: block;
    margin: 0 auto;
  }
</style>
:::

2. 整合定位居中

::: demo

<div id="parent3-2">
  <div id="child3-2">居中布局</div>
</div>
<style>
  #parent3-2 {
    width: 100%;
    height: 200px;
    background: #ccc;
    position: relative;
  }
  #child3-2 {
    width: 100px;
    height: 100px;
    background: #c9394a;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
  }
</style>
:::

#### 两列布局

1. float + margin
   > 原理:利用浮动元素脱离文档流的特性处理块状元素的占行

::: demo

<div id="left4-1"></div>
<div id="right4-1">
  <div id="inner4-1"></div>
</div>
<style>
  #left4-1,
  #right4-1 {
    height: 200px;
  }
  #left4-1 {
    width: 200px;
    background: #c9394a;
    float: left;
  }
  #right4-1 {
    background: #ccc;
    margin-left: 200px;
  }
  #inner4-1 {
    height: 200px;
    background: green;
  }
  #inner4-1::after {
    clear: both
  }
</style>
:::

2. float + overflow:hidden
   > 原理:在方案一的基础上 ，利用 bfc 解决边距 

::: demo

<div id="left4-2"></div>
  <div id="right4-2">
</div>
<style>
  #left4-2,
  #right4-2 {
    height: 200px;
  }
  #left4-2 {
    height: 200px;
    width: 200px;
    background: #c9394a;
    float: left; 
  }
  #right4-2 {
    background: #ccc;
    overflow: hidden;
  }
</style>
:::

3. table + table-layout:fixed
   > 原理:利用 table 元素的 table-layout:fixed 属性自动分配

::: demo

 <div id="parent4-3">
    <div id="left4-3"></div>
    <div id="right4-3"></div>
  </div>
  <style>
    #parent4-3 {
      display: table;
      table-layout: fixed;
      width: 100%;
    }
    #left4-3,
    #right4-3 {
      height: 200px;
      display: table-cell;
    }
    #left4-3 {
      width: 200px;
      background: #c9394a;
    }
    #right4-3 {
      background: #ccc;
    }
  </style>
:::

#### 三列布局

1. float: left + right
   > 原理:左右浮动 ，中间自适应

::: demo

<div id="left5-1"></div>
<div id="center5-1"></div>
<div id="right5-1"></div>
<style>
  #left5-1,
  #center5-1,
  #right5-1 {
    height: 200px;
  }
  #left5-1 {
    width: 100px;
    background: #c9394a;
    float: left;
  }
  #center5-1 {
    width: 100px;
    background: green;
    float: left;
  }
  #right5-1 {
    background: #ccc;
    margin-left: 200px;
  }
</style>
  :::

> 解决老版本浏览器白边问题扩展:

:::demo

<div id="left5-2"></div>
<div id="right5-2"></div>
<div id="center5-2"></div>
<style>
#left5-2,
#center5-2,
#right5-2 {
  height: 200px;
}
#left5-2,
#right5-2 {
  width: 100px;
}
#left5-2 {
  background: #c9394a;
  float: left;
}
#center5-2 {
  background: green;
  margin-left: 100px;
  margin-right: 100px;
}
#right5-2 {
  background: #ccc;
  float: right;
}
</style>
:::

#### 圣杯布局

> 原理:在三列布局的基础上,增加如父节点 ，改变子节点排列顺序从而加强 seo 解析

:::demo

<div id="parent6-1">
  <div id="center6-1"></div>
  <div id="left6-1"></div>
  <div id="right6-1"></div>
</div>
<style>
  #parent6-1 {
    height: 200px;
    margin-left: 100px;
    margin-right: 100px;
  }
  #left6-1,
  #center6-1,
  #right6-1 {
    height: 200px;
    float: left;
  }
  #left6-1,
  #right6-1 {
    width: 100px;
  }
  #left6-1 {
    background: #c9394a;
    margin-left: -100%;
    position: relative;
    left: -100px;
  }
  #center6-1 {
    width: 100%;
    background: green;
  }
  #right6-1 {
    background: #ccc;
    margin-left: -100px;
    position: relative;
    right: -100px;
  }
</style>
:::

#### 双飞翼布局

1. float: left/right + margin-left
   > 原理:左右浮动,中间自适应,margin-left 负值解决左右位置偏移

:::demo

<div id="parent7-1">
  <div id="center7-1">
    <div id="inner7-1"></div>
  </div>
  <div id="left7-1"></div>
  <div id="right7-1"></div>
</div>
<style>
  #parent7-1 {
    height: 200px;
  }
  #left7-1,
  #center7-1,
  #right7-1 {
    height: 200px;
    float: left;
  }
  #left7-1,
  #right7-1 {
    width: 100px;
  }
  #left7-1 {
    background: #c9394a;
    margin-left: -100%;
  }
  #center7-1 {
    width: 100%;
    background: green;
  }
  #right7-1 {
    background: #ccc;
    margin-left: -100px;
  }
  #inner7-1 {
    height: 200px;
    background: hotpink;
    margin-left: 100px;
    margin-right: 100px;
  }
</style>
:::

#### 等分布局

1. float + width: %

:::demo

<div id="parent8-1">
  <div class="col8-1 col1"></div>
  <div class="col8-1 col2"></div>
  <div class="col8-1 col3"></div>
  <div class="col8-1 col4"></div>
</div>
<style>
  .col8-1 {
    width: 25%;
    height: 200px;
    float: left;
  }
  .col1 {
    background: hotpink;
  }
  .col2 {
    background: lightblue;
  }
  .col3 {
    background: lightgreen;
  }
  .col4 {
    background: lightyellow;
  }
</style>
:::

> 加入边距
> 子元素增加左边距 ，父元素缩减第一个左边距

:::demo

<div class="parent-fix8-2">
  <div id="parent8-2">
    <div class="col8-2">
      <div class="col1"></div>
    </div>
    <div class="col8-2">
      <div class="col2"></div>
    </div>
    <div class="col8-2">
      <div class="col3"></div>
    </div>
    <div class="col8-2">
      <div class="col4"></div>
    </div>
  </div>
</div>
<style>
  #parent-fix8-2 {
    overflow: hidden;
  }
  #parent8-2 {
    height: 200px;
    margin-left: -10px;
  }
  .col8-2 {
    width: 25%;
    float: left;
    box-sizing: border-box;
    padding-left: 10px;
  }
  .col8-2 > div {
    height: 200px;
  }
  .col1 {
    background: hotpink;
  }
  .col2 {
    background: lightblue;
  }
  .col3 {
    background: lightgreen;
  }
  .col4 {
    background: lightyellow;
  }
</style>
:::

2. table + table-cell

:::demo

<div id="parent8-3">
  <div class="col8-3 col1"></div>
  <div class="col8-3 col2"></div>
  <div class="col8-3 col3"></div>
  <div class="col8-3 col4"></div>
</div>
<style>
  #parent8-3 {
    display: table;
    width: 100%;
  }
  .col8-3 {
    display: table-cell;
    height: 200px;
  }
  .col1 {
    background: hotpink;
  }
  .col2 {
    background: lightblue;
  }
  .col3 {
    background: lightgreen;
  }
  .col4 {
    background: lightyellow;
  }
  </style>
:::

> 加入边距

:::demo

<div class="parent-fix8-4">
  <div id="parent8-4">
    <div class="col8-4">
      <div class="col1"></div>
    </div>
    <div class="col8-4">
      <div class="col2"></div>
    </div>
    <div class="col8-4">
      <div class="col3"></div>
    </div>
    <div class="col8-4">
      <div class="col4"></div>
    </div>
  </div>
</div>
<style>
  #parent-fix8-4 {
    overflow: hidden;
  }
  #parent8-4 {
    width: 100%;
    display: table;
    margin-left: -10px;
  }
  .col8-4 {
    display: table-cell;
    height: 200px;
    box-sizing: border-box;
    padding-left: 10px;
  }
  .col8-4>div {
    height: 200px;
  }
  .col1 {
    background: hotpink;
  }
  .col2 {
    background: lightblue;
  }
  .col3 {
    background: lightgreen;
  }
  .col4 {
    background: lightyellow;
  }
</style>
:::
#### 等高布局

1. table

:::demo

<div id="parent9-1">
  <div id="left9-1">left</div>
  <div id="right9-1">right right right right right right right right right right right right right right right right right right right right right right right right right right right right right</div>
</div>
<style>
  #parent9-1 {
    display: table;
  }
  #left9-1,#right9-1{
    display: table-cell;
  }
  #left9-1{
    width: 200px;
    background: hotpink;
  }
  #right9-1{
    background: lightgreen;
  }
</style>
:::

2. padding-bottom + margin-bottom

> 原理:padding 与 margin 正副值(值必须很大)相抵
> 缺点:完全是视觉欺骗 + 性能问题

:::demo

<div id="parent9-2">
  <div id="left9-2">left</div>
  <div id="right9-2">right right right right right right right right right right right right right right right right right right right right right right right right right right right right right</div>
</div>
<style>
  #parent9-2 {
    overflow: hidden;
  }
  #left9-2,#right9-2{
    width: 200px;
    float: left;
    padding-bottom:9999px ;
    margin-bottom:-9999px ;
  }
  #left9-2{
    background: hotpink;
  }
  #right9-2{
    background: lightgreen;
  }
</style>
:::

#### 多列布局

columns

> 缺点:实际为一列拆拆分多列显示 ，场景有限

:::demo
<div id="parent10">
  <div class="col10 col1">
    columns1 columns1 columns1 columns1 columns1 columns1 columns1 columns1 columns1 columns1 columns1 columns1 columns1 columns1 columns1 
  </div>
  <div class="col10 col2">
    columns2 columns2 columns2 columns2 columns2 columns2 columns2 columns2 columns2 columns2 columns2 columns2 columns2 columns2 columns2 
  </div>
  <div class="col10 col3">
    columns3 columns3 columns3 columns3 
  </div>
  <div class="col10 col4">
    columns4  columns4  columns4  columns4  columns4  columns4  columns4  columns4  columns4  columns4  columns4  columns4  columns4  columns4  columns4  columns4 
  </div>
</div>
<style>
  #parent10 {
    columns: 4 200px;
    column-gap: 20px;
    column-rule: 5px romato double;
  }
  .col1 {
    background: hotpink;
  }
  .col2 {
    background: lightblue;
  }
  .col3 {
    background: lightgreen;
  }
  .col4 {
    background: lightyellow;
  }
</style>
:::
