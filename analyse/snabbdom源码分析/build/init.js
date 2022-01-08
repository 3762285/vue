import {vnode} from "./vnode";
import * as is from "./is";
import {htmlDomApi} from "./htmldomapi";

function isUndef(s) {
    return s === undefined;
}

function isDef(s) {
    return s !== undefined;
}

const emptyNode = vnode("", {}, [], undefined, undefined);

/*
    @ sameVnode(..)
    key相同且sel选择符也相同
    is的作用目前还未知
 */
function sameVnode(vnode1, vnode2) {
    var _a, _b;
    const isSameKey = vnode1.key === vnode2.key;
    const isSameIs = ((_a = vnode1.data) === null || _a === void 0 ? void 0 : _a.is) === ((_b = vnode2.data) === null || _b === void 0 ? void 0 : _b.is);
    const isSameSel = vnode1.sel === vnode2.sel;
    return isSameSel && isSameKey && isSameIs;
}

/*
    @ isVnode(vnode)
    一个对象，只要有sel属性就认为是vnode,比如：
    {
       sel:"div#container"
       ..
    }
 */
function isVnode(vnode) {
    return vnode.sel !== undefined;
}

/*
    @ createKeyToOldIdx
    拿数组类比，比如[1,2,3,4,5,6,7,8,9]
    假如此时的beginIdx = 3,endIdx =6,结果就是[4,5,6,7]四个值
    换句话说就是经过diff算法执行之后,旧结点还没参与比较的那一段范围
    然后用key-value组装成一个对象返回
 */
function createKeyToOldIdx(children, beginIdx, endIdx) {
    var _a;
    const map = {};
    for (let i = beginIdx; i <= endIdx; ++i) {
        const key = (_a = children[i]) === null || _a === void 0 ? void 0 : _a.key;
        if (key !== undefined) {
            map[key] = i;
        }
    }
    return map;
}

const hooks = [
    "create",
    "update",
    "remove",
    "destroy",
    "pre",
    "post",
];

export function init(modules, domApi) {
    const cbs = {
        create: [],
        update: [],
        remove: [],
        destroy: [],
        pre: [],
        post: [],
    };
    const api = domApi !== undefined ? domApi : htmlDomApi;
    /*
        说明:
            这里主要将每个modules下的hook方法提取出来存到cbs里面
            初始化的时候,将每个modules下的相应的钩子都追加到一个数组里面,create,update...等等
            在进行patch的各个阶段,触发对应的钩子去处理相应的事情
            这种方式比较方便扩展. 新增钩子的时候,不需要更改主要的流程

        另注:
            这些模块的钩子主要用在更新节点的时候,会在不同的生命周期里面去触发对应的钩子,从而更新这些模块
            例如元素的attr、props、class之类的
     */
    for (const hook of hooks) {
        for (const module of modules) {
            const currentHook = module[hook];
            if (currentHook !== undefined) {
                cbs[hook].push(currentHook);
            }
        }
    }

    /*
        @ function emptyNodeAt(elm)
        可能的一种情形,比如elm是一个DOM元素:
            <div id="container" class="active selected"></div>
            let container = document.getElementByID('container')
            emptyNodeAt(container)
     */
    function emptyNodeAt(elm) {
        const id = elm.id ? "#" + elm.id : "";  // id = #container
        // elm.className doesn't return a string when elm is an SVG element inside a shadowRoot.
        // https://stackoverflow.com/questions/29454340/detecting-classname-of-svganimatedstring
        const classes = elm.getAttribute("class"); //获取class属性 -> "active selected"
        const c = classes ? "." + classes.split(" ").join(".") : ""; //组合 -> .active.selected
        // 一种可能样式示例: sel = "div#container.active.selected", sel = 标签 + id + class
        return vnode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
    }

    function createRmCb(childElm, listeners) {
        return function rmCb() {
            if (--listeners === 0) {
                const parent = api.parentNode(childElm);
                api.removeChild(parent, childElm);
            }
        };
    }

    function createElm(vnode, insertedVnodeQueue) {
        var _a, _b;
        let i;
        let data = vnode.data;
        if (data !== undefined) {
            /*
                有没有init钩子？如果有则执行
                另注:
                    (_a = data.hook) === null,比如:
                    {
                        hook:null
                        ...
                    }
                    或者就没有定义...,判断_a === void 0
             */
            const init = (_a = data.hook) === null || _a === void 0 ? void 0 : _a.init;
            if (isDef(init)) {              // 有定义
                init(vnode);                // 执行init之后有可能改变vnode.data
                data = vnode.data;          // 再次赋值
            }
        }
        const children = vnode.children;
        const sel = vnode.sel;
        /*
            !表示注释节点
            例如: h("！",data,c)

            另注:
                注释节点还有一个重要作用就是清空节点,例如:
                patch(vnode,h('!')) # 创建一个注释节点并代换原来的内容
         */
        if (sel === "!") {
            if (isUndef(vnode.text)) {
                vnode.text = "";
            }
            vnode.elm = api.createComment(vnode.text); //创建注释节点
        } else if (sel !== undefined) {
            /*
                假如一种可能的sel样式如下:
                const vnode = h("div#container.two.classes", { on: { click: someFn } }....

                计算得到:
                hashIdx = hash = 3
                dotIdx = dot = 13
                tag = 'div'
                id = sel.slice(hash+1,dot) = 'container'
                class = sel.slice(dot+1).replace.... = 'two classes'
             */
            // Parse selector
            const hashIdx = sel.indexOf("#");
            const dotIdx = sel.indexOf(".", hashIdx);
            const hash = hashIdx > 0 ? hashIdx : sel.length;
            const dot = dotIdx > 0 ? dotIdx : sel.length;
            const tag = hashIdx !== -1 || dotIdx !== -1
                ? sel.slice(0, Math.min(hash, dot))
                : sel;
            const elm = (vnode.elm =
                isDef(data) && isDef((i = data.ns))
                    ? api.createElementNS(i, tag, data)
                    : api.createElement(tag, data));
            if (hash < dot)
                elm.setAttribute("id", sel.slice(hash + 1, dot));
            if (dotIdx > 0)
                elm.setAttribute("class", sel.slice(dot + 1).replace(/\./g, " "));
            for (i = 0; i < cbs.create.length; ++i)
                cbs.create[i](emptyNode, vnode);


            /*
                如果有children则递归创建,并追加到元素下
             */
            if (is.array(children)) {
                for (i = 0; i < children.length; ++i) {
                    const ch = children[i];
                    if (ch != null) {
                        api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                    }
                }
            } else if (is.primitive(vnode.text)) {
                /*
                    如果children存在且只是普通文本,比如: h('div#container',data,'hello snabbdom')
                    则创建一个普通的文本结点挂到elm下
                 */
                api.appendChild(elm, api.createTextNode(vnode.text));
            }


            const hook = vnode.data.hook;
            if (isDef(hook)) {
                // 执行create钩子
                (_b = hook.create) === null || _b === void 0 ? void 0 : _b.call(hook, emptyNode, vnode);

                // 如果有insert钩子,则将vnode推到队列,准备后期的insert执行...
                if (hook.insert) {
                    insertedVnodeQueue.push(vnode);
                }
            }
        } else {
            // 创建文本节点
            vnode.elm = api.createTextNode(vnode.text);
        }
        return vnode.elm;
    }

    function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
        for (; startIdx <= endIdx; ++startIdx) {
            const ch = vnodes[startIdx];
            if (ch != null) {
                api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
            }
        }
    }

    function invokeDestroyHook(vnode) {
        var _a, _b;
        const data = vnode.data;
        if (data !== undefined) {
            (_b = (_a = data === null || data === void 0 ? void 0 : data.hook) === null || _a === void 0 ? void 0 : _a.destroy) === null || _b === void 0 ? void 0 : _b.call(_a, vnode);
            for (let i = 0; i < cbs.destroy.length; ++i)
                cbs.destroy[i](vnode);
            if (vnode.children !== undefined) {
                for (let j = 0; j < vnode.children.length; ++j) {
                    const child = vnode.children[j];
                    if (child != null && typeof child !== "string") {
                        invokeDestroyHook(child);
                    }
                }
            }
        }
    }

    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
        var _a, _b;
        for (; startIdx <= endIdx; ++startIdx) {
            let listeners;
            let rm;
            const ch = vnodes[startIdx];
            if (ch != null) {
                if (isDef(ch.sel)) {
                    invokeDestroyHook(ch);
                    listeners = cbs.remove.length + 1;
                    rm = createRmCb(ch.elm, listeners);
                    for (let i = 0; i < cbs.remove.length; ++i)
                        cbs.remove[i](ch, rm);
                    const removeHook = (_b = (_a = ch === null || ch === void 0 ? void 0 : ch.data) === null || _a === void 0 ? void 0 : _a.hook) === null || _b === void 0 ? void 0 : _b.remove;
                    if (isDef(removeHook)) {
                        removeHook(ch, rm);
                    } else {
                        rm();
                    }
                } else {
                    // Text node
                    api.removeChild(parentElm, ch.elm);
                }
            }
        }
    }
    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
        let oldStartIdx = 0;                        // 旧结点开始索引
        let newStartIdx = 0;                        // 新结点开始索引
        let oldEndIdx = oldCh.length - 1;           // 旧结点结束索引
        let oldStartVnode = oldCh[0];               // 旧结点开始vnode
        let oldEndVnode = oldCh[oldEndIdx];         // 旧结点结束vnode
        let newEndIdx = newCh.length - 1;           // 新结点结束索引
        let newStartVnode = newCh[0];               // 新结点开始vnode
        let newEndVnode = newCh[newEndIdx];         // 新结点结束vnode
        let oldKeyToIdx;
        let idxInOld;
        let elmToMove;
        let before;
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (oldStartVnode == null) {
                oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
            } else if (oldEndVnode == null) {
                oldEndVnode = oldCh[--oldEndIdx];
            } else if (newStartVnode == null) {
                newStartVnode = newCh[++newStartIdx];
            } else if (newEndVnode == null) {
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldStartVnode, newStartVnode)) {  // 旧开始 -> 新开始
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            } else if (sameVnode(oldEndVnode, newEndVnode)) {  // 旧结束 -> 新结束
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldStartVnode, newEndVnode)) { // 旧开始 -> 新结束
                // Vnode moved right
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            } else if (sameVnode(oldEndVnode, newStartVnode)) { // 旧结束 -> 新开始
                // Vnode moved left
                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            } else {
                if (oldKeyToIdx === undefined) {
                    oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                }
                idxInOld = oldKeyToIdx[newStartVnode.key];
                if (isUndef(idxInOld)) {
                    // New element
                    api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                } else {
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.sel !== newStartVnode.sel) {
                        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    } else {
                        patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                        oldCh[idxInOld] = undefined;
                        api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                    }
                }
                newStartVnode = newCh[++newStartIdx];
            }
        }
        if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
            if (oldStartIdx > oldEndIdx) {
                before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
                addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
            } else {
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
            }
        }
    }

    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
        var _a, _b, _c, _d, _e;
        const hook = (_a = vnode.data) === null || _a === void 0 ? void 0 : _a.hook;
        // 执行prepatch钩子(如果存在)
        (_b = hook === null || hook === void 0 ? void 0 : hook.prepatch) === null || _b === void 0 ? void 0 : _b.call(hook, oldVnode, vnode);

        const elm = (vnode.elm = oldVnode.elm); // 一种解释：让新vnode知道自己要更新哪个dom元素，这里给予赋值

        const oldCh = oldVnode.children;
        const ch = vnode.children;

        if (oldVnode === vnode) // 比如: patch(vnode1,vnode1)
            return;

        // 依然执行hook
        if (vnode.data !== undefined) {
            for (let i = 0; i < cbs.update.length; ++i)
                cbs.update[i](oldVnode, vnode);
            (_d = (_c = vnode.data.hook) === null || _c === void 0 ? void 0 : _c.update) === null || _d === void 0 ? void 0 : _d.call(_c, oldVnode, vnode);
        }

        // 新vnode,无text,有children
        if (isUndef(vnode.text)) {
            // 新vnode有children, 旧vnode有children
            if (isDef(oldCh) && isDef(ch)) {
                if (oldCh !== ch)
                    updateChildren(elm, oldCh, ch, insertedVnodeQueue);
                // 新vnode 有children 旧vnode 无children,有text
            } else if (isDef(ch)) {
                if (isDef(oldVnode.text))
                    api.setTextContent(elm, ""); // 清空text
                // 添加children
                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
                // 新vnode无children 旧vnode有children
            } else if (isDef(oldCh)) {
                // 移除children
                removeVnodes(elm, oldCh, 0, oldCh.length - 1);
                // 老vnode 有text
            } else if (isDef(oldVnode.text)) {
                // 清空text
                api.setTextContent(elm, "");
            }
            /*
                如果vnode仅仅定义一个text,比如:
                h(sel,data,'hello snabbdom'),就是说明仅改变旧结点的文本即可
                此外,如果旧节点有孩子节点,
            */
            // 新vnode有text 无children, 老vnode text不等于新vnode text
        } else if (oldVnode.text !== vnode.text) {
            if (isDef(oldCh)) {
                removeVnodes(elm, oldCh, 0, oldCh.length - 1);
            }
            api.setTextContent(elm, vnode.text);
        }
        (_e = hook === null || hook === void 0 ? void 0 : hook.postpatch) === null || _e === void 0 ? void 0 : _e.call(hook, oldVnode, vnode);
    }

    return function patch(oldVnode, vnode) {
        let i, elm, parent;
        const insertedVnodeQueue = [];                  //用于收集所有插入的元素

        for (i = 0; i < cbs.pre.length; ++i)            //先调用pre回调
            cbs.pre[i]();

        if (!isVnode(oldVnode)) { //如果老节点非vnode(比如为Dom元素),则创建一个空的vnode
            oldVnode = emptyNodeAt(oldVnode);
        }

        if (sameVnode(oldVnode, vnode)) {               //如果是同个节点,则进行修补
            patchVnode(oldVnode, vnode, insertedVnodeQueue);
        } else {
            //不同vnode节点则新建
            elm = oldVnode.elm;
            parent = api.parentNode(elm);
            createElm(vnode, insertedVnodeQueue);

            // 插入新节点,删除老节点
            if (parent !== null) {
                api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
                removeVnodes(parent, [oldVnode], 0, 0);
            }
        }

        // 遍历所有收集到的插入节点,调用插入的钩子
        for (i = 0; i < insertedVnodeQueue.length; ++i) {
            insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
        }

        //调用post钩子
        for (i = 0; i < cbs.post.length; ++i)
            cbs.post[i]();
        return vnode;
    };
}

//# sourceMappingURL=init.js.map
