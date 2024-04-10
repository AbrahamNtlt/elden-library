/** 函数柯里化
 * 用法：函数柯里化是一种将接受多个参数的函数转换为接受一系列单一参数的函数的技术
 * 思路：
 *  1、使用 fn.length 获取函数的形参数量
 *  2、如果没有传入初始参数数组 则将其初始化为空数组 在递归的时候会接受上一次的形参
 *  3、返回一个闭包函数 接受函数的实参 将 args 中的形参和当前的形参进行合并 得到 newArgs
 *  4、如果新的参数数组 newArgs 长度大于等于 length 函数的形参数量 调用 apply 执行函数 传入 newArgs
 *  5、如果新的参数数组长度小于函数的形参数量 则再次调用 curry 函数 将新的参数数组作为初始参数传入 返回一个新的闭包函数
 * ps: 假定fn为固定长度, 当参数达到长度后返回函数执行,
 * 另可fn不固定长度, 每次执行都返回
 * @param {*} fn
 * @param {*} args
 * @return {*}
 */
function curry(fn, ...args) {
  const length = fn.length;
  let oldArgs = [...args];
  return function () {
    const newArgs = [...oldArgs, ...arguments];
    oldArgs = newArgs;
    if (newArgs.length >= length) {
      return fn.apply(this, newArgs);
    } else {
      return curry(fn, newArgs);
    }
  };
}

// 1, 6, 2, 3, 5, 4
const p1 = new Promise((resolve) => {
  console.log(1);
  resolve(2);
});

const p2 = new Promise((resolve) => {
  setTimeout(() => {
    console.log(3);
    resolve(4);
  }, 0);
});

setTimeout(() => {
  console.log(5);
}, 0);

p1.then((res) => {
  console.log(res);
});

p2.then((res) => {
  console.log(res);
});

console.log(6);
