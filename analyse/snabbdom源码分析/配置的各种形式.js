function h(sel, data, c) {

}

h("div#container.two.classes", {
    on: {
        click: someFn
    },
    style: {
        fontWeight: "normal",
        fontStyle: "italic",
        color: "#00ffff"
    },
    class: {
        active: true,
        selected: false
    },
    attrs: {
        href: '/foo'
    },
    dataset: {
        action: "reset"
    },
    props: {
        href: "/bar"
    },
    //钩子
    hook: {
        pre: function () {
        },
        init: function (vnode) {
        },
        create: function (emptyVnode, vnode) {
        },
        insert: (vnode) => {
            movie.eleHeight = vnode.elm.offsetHeight
        },
        prepatch: function (oldVnode, vnode) {
        },
        update: function (oldVnode, vnode) {
        },
        postpatch: function (oldVnode, vnode) {
        },
        destory: function (vnode) {
        },
        remove: function (vnode, removeCallback) {
        },
        post: function () {
        }
    }

}, [])