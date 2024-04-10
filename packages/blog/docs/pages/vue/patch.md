### patch

`patch` 也叫 `patching` 算法或 `dom-diff` 算法，其本身即打补丁的字面意思。

#### createPatchFunction

`createPatchFunction` 是 `patch` 的工厂函数，由于源码太长，此处介绍核心 api 和部分核心算法的源码。

| 函数               | 表述                         |
| ------------------ | ---------------------------- |
| insertedVnodeQueue | 通过比对后需要新增的节点队列 |
| createElm          | 创建节点                     |
| patchVnode         | 更新比对                     |
| invokeInsertHook   | 执行 insert 钩子函数         |
| invokeDestroyHook  | 执行 destroy 钩子函数        |

对节点的修改操作只需要做三件事：添加、删除、更新

1. 当新不存在新节点时，若有旧节点则删除旧节点。在比对子节点时，情况类似，执行另外的删除节点函数

```js
if (isUndef(vnode)) {
  if (isDef(oldVnode)) invokeDestroyHook(oldVnode);
  return;
}
```

```js
function removeVnodes(vnodes, startIdx, endIdx) {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx];
    if (isDef(ch)) {
      if (isDef(ch.tag)) {
        removeAndInvokeRemoveHook(ch);
        invokeDestroyHook(ch);
      } else {
        removeNode(ch.elm);
      }
    }
  }
}
function removeNode(el) {
  const parent = nodeOps.parentNode(el);
  // element may have already been removed due to v-html / v-text
  if (isDef(parent)) {
    nodeOps.removeChild(parent, el);
  }
}
```

2. 当存在新节点又不存在旧节点时，直接插入新节点

```js
if (isUndef(oldVnode)) {
  // empty mount (likely as component), create new root element
  isInitialPatch = true;
  createElm(vnode, insertedVnodeQueue);
}
```

```js
function createElm(
  vnode,
  insertedVnodeQueue,
  parentElm,
  refElm,
  nested,
  ownerArray,
  index
) {
  if (isDef(vnode.elm) && isDef(ownerArray)) {
    vnode = ownerArray[index] = cloneVNode(vnode);
  }
  vnode.isRootInsert = !nested; // for transition enter check
  if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
    return;
  }

  const data = vnode.data;
  const children = vnode.children;
  const tag = vnode.tag;
  if (isDef(tag)) {
    vnode.elm = vnode.ns
      ? nodeOps.createElementNS(vnode.ns, tag)
      : nodeOps.createElement(tag, vnode);
    setScope(vnode);

    if (__WEEX__) {
      //略
    } else {
      createChildren(vnode, children, insertedVnodeQueue);
      if (isDef(data)) {
        invokeCreateHooks(vnode, insertedVnodeQueue);
      }
      insert(parentElm, vnode.elm, refElm);
    }
  } else if (isTrue(vnode.isComment)) {
    vnode.elm = nodeOps.createComment(vnode.text);
    insert(parentElm, vnode.elm, refElm);
  } else {
    vnode.elm = nodeOps.createTextNode(vnode.text);
    insert(parentElm, vnode.elm, refElm);
  }
}
```

3. 如果是相同节点则更新

```js
const isRealElement = isDef(oldVnode.nodeType);
if (!isRealElement && sameVnode(oldVnode, vnode)) {
  // patch existing root node
  patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
}
```

判断是否为相同节点的条件如下

```js
function sameVnode(a, b) {
  return (
    a.key === b.key && //key相同
    ((a.tag === b.tag && //标签名相同
    a.isComment === b.isComment && //同样是注释节点或同样不是
    isDef(a.data) === isDef(b.data) && //同样定义了data或同样不是
      sameInputType(a, b)) || //如果是input的标签 判断 type 是否相同
      (isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)))
  );
}
```

```js
function patchVnode(
  oldVnode,
  vnode,
  insertedVnodeQueue,
  ownerArray, //子节点数组
  index, //子节点数组中的下标
  removeOnly //特殊的标识 用于 <transition-group>
) {
  // ------------------ 静态节点等情况优化计算  -------------
  if (oldVnode === vnode) {
    return;
  }

  if (isDef(vnode.elm) && isDef(ownerArray)) {
    // clone reused vnode
    vnode = ownerArray[index] = cloneVNode(vnode);
  }

  var elm = (vnode.elm = oldVnode.elm);

  if (isTrue(oldVnode.isAsyncPlaceholder)) {
    if (isDef(vnode.asyncFactory.resolved)) {
      hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
    } else {
      vnode.isAsyncPlaceholder = true;
    }
    return;
  }
  if (
    isTrue(vnode.isStatic) &&
    isTrue(oldVnode.isStatic) &&
    vnode.key === oldVnode.key &&
    (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
  ) {
    vnode.componentInstance = oldVnode.componentInstance;
    return;
  }
  // ------------------优化计算 end -------------
  // ------------------触发声明周期钩子 -------------
  var i;
  var data = vnode.data;
  if (isDef(data) && isDef((i = data.hook)) && isDef((i = i.prepatch))) {
    i(oldVnode, vnode);
  }

  var oldCh = oldVnode.children;
  var ch = vnode.children;
  if (isDef(data) && isPatchable(vnode)) {
    for (i = 0; i < cbs.update.length; ++i) {
      cbs.update[i](oldVnode, vnode);
    }
    if (isDef((i = data.hook)) && isDef((i = i.update))) {
      i(oldVnode, vnode);
    }
  }
  // ------------------触发声明周期钩子  end-------------
  if (isUndef(vnode.text)) {
    if (isDef(oldCh) && isDef(ch)) {
      //②
      if (oldCh !== ch) {
        updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
      }
    } else if (isDef(ch)) {
      //③
      if (process.env.NODE_ENV !== 'production') {
        checkDuplicateKeys(ch);
      }
      if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '');
      }
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
    } else if (isDef(oldCh)) {
      //④
      removeVnodes(oldCh, 0, oldCh.length - 1);
    } else if (isDef(oldVnode.text)) {
      //⑤
      nodeOps.setTextContent(elm, '');
    }
  } else if (oldVnode.text !== vnode.text) {
    nodeOps.setTextContent(elm, vnode.text); //①
  }
  // ------------------触发声明周期钩子-------------
  if (isDef(data)) {
    if (isDef((i = data.hook)) && isDef((i = i.postpatch))) {
      i(oldVnode, vnode);
    }
  }
  // ------------------触发声明周期钩子  end-------------
}
```

1. 如果新节点文本属性 `text` 时，替换更新文本节点
2. 如果新旧节点都有子节点，且不相同时，更新替换子节点 `updateChildren`
3. 如果新节点有子节点而旧节点没有，则添加子节点
4. 如果旧节点有子节点而新节点没有，则删除子节点
5. 如果新旧节点都没有子节点，新节点没有文本属性而旧节点有则清除文本节点


#### 更新子节点 updateChildren

由于子节点存在数组的情况，子节点的更新比对比单一节点复杂的多。除了插入、插入、更新外还存在移动节点的情况。

```js
  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm

    const canMove = !removeOnly     //特殊标识,通常 canMove 为true

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
        } else {
          vnodeToMove = oldCh[idxInOld]
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx)
            oldCh[idxInOld] = undefined
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(oldCh, oldStartIdx, oldEndIdx)
    }
  }
```
在比对子节点是存在优化策略，在开发过程中的数组操作并不是无序的重新排列而常常为：`push`、`pop`、`shift`、`unshift`、`reverse`。
`newStartVnode`、`newEndVnode`、`oldStartVnode`、`oldEndVnode`分别代表正在比对的新旧子节点数组的开头与结尾节点，比对方式是从两边向内比对。
