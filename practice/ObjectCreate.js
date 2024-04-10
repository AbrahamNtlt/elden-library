/** 手写 Object.create
 * 用法：创建一个新的对象，将传入的对象原型指向新对象并返回
 * 思路：
 *  1、将原型写入到一个函数里面，然后将函数返回
 * @param {*} obj
 * @return {*}
 */

function ObjectCreate(obj) {
  function Fn() {}
  Fn.prototype = obj;
  return new Fn();
}
