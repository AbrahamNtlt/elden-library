因为arguments是一个对象，它的属性是从 0 开始依次递增的数字，还有callee和length等属性，与数组非常相似；但是它们却没有数组常见的方法属性，如forEach, reduce等，所以我们叫它们类数组。

要遍历类数组，有三个方法：

将数组的方法应用到类数组上，这时候就可以使用call和apply方法，如：

function foo(){ 
  Array.prototype.forEach.call(arguments, a => console.log(a))
}
使用Array.from方法将类数组转化成数组：‌

function foo(){ 
  const arrArgs = Array.from(arguments) 
  arrArgs.forEach(a => console.log(a))
}
使用展开运算符将类数组转化成数组

function foo(){ 
    const arrArgs = [...arguments] 
    arrArgs.forEach(a => console.log(a)) 
}
