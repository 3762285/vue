function patch(oldVnode, newVnode) {
    if (oldVnode.key == newVnode.key && oldVnode.sel == newVnode.sel) {
        console.log('is the same node')
        if (oldVnode === newVnode)
            return
        if (newVnode.text != oldVnode.text) {
            // 如果新虚拟节点中的text和老的虚拟节点的text不同，那么直接让新的text写入老的elm中即可。如果老的elm中是
            // children,那么也会立即消失掉
            oldVnode.elm.innerText = newVnode.text
        }else{
            console.log('新vnode没有text属性..')
            if(oldVnode.children !=undefined && oldVnode.children.length>0){

            }else{
                oldVnode.elm.innerHTML =''
                for(let i=0;i<newVnode.children.length;i++){
                    let dom=createElement(newVnode.children[i])
                    oldVnode.elm.appendChild(dom)
                }
            }
        }
    } else {
        /*
            不同节点
         */
        console.log('not the same node,')
        let newVnodeElm = createElement(newVnode)
        // 插入到老节点之前
        if (oldVnode.elm.parentNode && newVnodeElm) {
            oldVnode.elm.parentNode.insertBefore(newVnodeElm, oldVnode.elm)
        }
        // 删除老节点
        oldVnode.elm.parentNode.removeChild(oldVnode.elm)
    }
}