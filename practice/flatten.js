/** 数组拍平
 *  递归
 */
function flatten1(arr) {
  const newArr = [];
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    Array.isArray(item)
      ? (newArr = newArr.concat(flatten1(item)))
      : newArr.push(item);
  }
}

/** 数组拍平
 *  栈
 */
function flatten2(arr) {
  const stack = [...arr];
  const result = [];
  while (stack.length) {
    const next = stack.pop();
    if(Array.isArray(next)) {
      stack.push(...next)
    } else {
      result.push(next)
    }
  }
  return result
}

/** 数组拍平
 *  ES6 filter 结构赋值 和 concat
 */

function flatten3(arr) {
  while (arr.some((item) => Array.isArray(item))) {
    arr = [].concat(...arr)
  }
  return arr
}
