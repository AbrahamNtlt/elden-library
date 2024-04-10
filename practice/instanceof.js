/** 手写 instanceof 方法
 * 用法：instanceof 运算符用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上。
 * 思路：
 *  1、通过 Object.getPrototypeOf 获取 obj 的原型
 *  2、循环判断 objProtoType 是否和 constructor 的原型相等
 *    2.1、如果相等就返回 true
 *    2.2、如果不相等 就重新赋值一下 obj 的原型 进入下一次循环
 *  3、判断是 objProtoType 是否为空 如果为空就说明不存在 返回 false
 * @param {Object} obj 需要判断的数据
 * @param {Object} constructor
 * @return {*}
 */
function instanceofFn(obj, Fn) {
  let proto = Object.getPrototypeOf(obj);
  while (true) {
    if (proto === Fn.prototype) return true;
    if (!proto) return false;
    proto = Object.getPrototypeOf(proto);
  }
}
