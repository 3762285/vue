import { vnode } from "./vnode";
import * as is from "./is";
function addNS(data, children, sel) {
    data.ns = "http://www.w3.org/2000/svg";
    if (sel !== "foreignObject" && children !== undefined) {
        for (let i = 0; i < children.length; ++i) {
            const childData = children[i].data;
            if (childData !== undefined) {
                addNS(childData, children[i].children, children[i].sel);
            }
        }
    }
}
export function h(sel, b, c) {
    let data = {};
    let children;
    let text;
    let i;

    // 定义了c,至少三个形参
    if (c !== undefined) {
        if (b !== null) {  //例如样式: h(sel,{...},c)
            data = b;
        }
        if (is.array(c)) { //例如样式: h(sel,{...},[...])
            children = c;
        }
        // c是字符串或number
        else if (is.primitive(c)) { //例如样式: h(sel,{..},'hello snabbdom')
            text = c.toString();
        }
        else if (c && c.sel) {  //例如样式: h(sel,{...},h(..)),或 h(sel,{...},{..sel:.})
            children = [c];
        }
        /*
            总结:
                c如果是数组，则认为是children
                c如果是字符串/number，则认为是text
                c如果形式为vnode(即:可以通过h函数得到,也可以直接用{}对象带入),则认为是children
                因此,一个vnode要么有children，要么有text，二选一
         */
    }
    // 定义了b,至少两个形参
    else if (b !== undefined && b !== null) {
        if (is.array(b)) {   // 例如样式: h(sel,[...])
            children = b;
        }
        else if (is.primitive(b)) { //例如样式: h(sel,'hello snabbdom')
            text = b.toString();
        }
        else if (b && b.sel) { //例如样式: h(sel,h(...)) ,或 h(sel,{...sel:xx...})
            children = [b];
        }
        else {
            data = b; //例如样式: h(sel,{...})
        }
        /*
            总结:
                b如果是数组，则认为是children
                b如果是字符串/number，则认为是text
                b如果是vnode(比如通过h函数计算得到或直接挂载vnode对象{}),则认为是children
                否则认为是data
         */
    }
    if (children !== undefined) {
        for (i = 0; i < children.length; ++i) {
            if (is.primitive(children[i]))
                children[i] = vnode(undefined, undefined, undefined, children[i], undefined);
        }
        /*
            可能[...]里面都是字符串，比如: h(sel,['blue','red','black','white']), 这里就将文本作为文本处理
         */
    }
    if (sel[0] === "s" &&
        sel[1] === "v" &&
        sel[2] === "g" &&
        (sel.length === 3 || sel[3] === "." || sel[3] === "#")) {
        addNS(data, children, sel);
    }
    return vnode(sel, data, children, text, undefined);
}
//# sourceMappingURL=h.js.map
