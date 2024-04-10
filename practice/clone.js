/** 浅拷贝
 * 用法：浅拷贝是指，一个新的对象对原始对象的属性值进行精确地拷贝，如果拷贝的是基本数据类型，拷贝的就是基本数据类型的值，如果是引用数据类型，拷贝的就是内存地址。如果其中一个对象的引用内存地址发生改变，另一个对象也会发生变化。
 * 思路：
 *  1、判断是否为对象
 *  2、根据obj类型创建一个新的对象
 *  3、for in 遍历对象 拿到 key
 *  4、判断 key 是否在 obj 中
 *  5、将 key 作为新对象的key 并赋值 value
 *
 * @param {*} obj
 * @return {*}
 */

function shallowClone(obj) {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  const newObj = Array.isArray(obj) ? [] : {};

  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

/** 深拷贝
 * 用法：拷贝一个对象的属性值 如果遇到属性值为引用类型的时候，它新建一个引用类型并将对应的值复制给它，因此对象获得的一个新的引用类型而不是一个原有类型的引用
 * 思路：
 *  1、判断是否为对象
 *  2、判段对象是否在 map 中 如果存在就不需要操作
 *  3、将 obj 放入 map 中 避免重复引用
 *  4、for in 遍历对象 拿到 key 判断 key 是否在 obj 中
 *  5、value 如果为对象 就递归拷贝 否则就赋值
 * @param {*} obj
 * @param {*} [map=new Map()]
 * @return {*}
 */

function deepClone(obj, map = new Map()) {
  if (!obj || typeof obj !== "object") {
    return obj;
  }
  if (map.get(obj)) {
    return map.get(obj);
  }
  map.set(obj, obj);

  const newObj = Array.isArray(obj) ? [] : {};
  Object.setPrototypeOf(newObj, Object.getPrototypeOf(obj));
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = deepClone(obj[key], map);
    }
  }

  return newObj;
}
