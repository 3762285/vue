import vnode from './vnode.js'

console.log('h函数执行')
export default function (sel, data, c) {
    if (arguments.length != 3) {
        throw new Error('必须传入三个参数...')
    }
    if (typeof c == 'string' || typeof c == 'number') {
        return vnode(sel, data, undefined, c, undefined)
    }
}
