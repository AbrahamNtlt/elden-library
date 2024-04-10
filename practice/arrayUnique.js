/** 数组去重
 *  Set结构
 */
function uniqueArr1(arr) {
  return [...new Set(arr)];
}

/** 数组去重
 *  filter 和 indexOf
 */
function uniqueArr2(arr) {
  return arr.filter((item, idx) => {
    return arr.indexOf(item) === idx;
  });
}
/** 数组去重
 *  使用Map存储
 */
function uniqueArr3(arr) {
  const map = new Map();
  const res = [];
  arr.forEach((item) => {
    if (!map.has(item)) {
      map.set(item, item);
      res.push(item);
    }
  });
  return res;
}
