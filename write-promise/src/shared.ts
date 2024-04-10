export function isFunc(obj: any) {
  return typeof obj === 'function'
}

export function isObj(obj: any) {
  return obj !== null && typeof obj === 'object'
}

export function runMicroTask(func: (val: any) => void) {
  if (undefined !== process && typeof process === 'object' && typeof process.nextTick === 'function') {
    process.nextTick(func)
  } else if (typeof MutationObserver === 'function') {
    const ob = new MutationObserver(func)
    const textNode = document.createTextNode('1')
    ob.observe(textNode, {
      characterData: true
    })
    textNode.data = '2'
  } else {
    setTimeout(func, 0)
  }
}

export function isThenAble(val: any) {
  if (isObj(val) || isFunc(val)) {
    return isFunc(val.then)
  }
  return false
}
