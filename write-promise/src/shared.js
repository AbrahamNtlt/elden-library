"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isThenAble = exports.runMicroTask = exports.isObj = exports.isFunc = void 0;
function isFunc(obj) {
    return typeof obj === 'function';
}
exports.isFunc = isFunc;
function isObj(obj) {
    return obj !== null && typeof obj === 'object';
}
exports.isObj = isObj;
function runMicroTask(func) {
    if (undefined !== process && typeof process === 'object' && typeof process.nextTick === 'function') {
        process.nextTick(func);
    }
    else if (typeof MutationObserver === 'function') {
        var ob = new MutationObserver(func);
        var textNode = document.createTextNode('1');
        ob.observe(textNode, {
            characterData: true
        });
        textNode.data = '2';
    }
    else {
        setTimeout(func, 0);
    }
}
exports.runMicroTask = runMicroTask;
function isThenAble(val) {
    if (isObj(val) || isFunc(val)) {
        return isFunc(val.then);
    }
    return false;
}
exports.isThenAble = isThenAble;
