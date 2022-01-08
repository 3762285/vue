import {
    init,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    h,
} from "snabbdom";

propsModule.pre = function ($1) {
    console.log('propsModule pre钩子调用')
}

const patch = init([
    // Init patch function with chosen modules
    classModule, // makes it easy to toggle classes
    propsModule, // for setting properties on DOM elements
    styleModule, // handles styling on elements with support for animations
    eventListenersModule, // attaches event listeners
]);
const container = document.getElementById('container')

/*const v1 = h('div', {
    style: {
        color: 'red'
    }
}, h('span', {
    style: {
        'font-weight': 'bold'
    }
}, 'hello snabbdom'))
patch(container, v1)*/

/*
const v2 = h("a", {
    props: {
        href: "/foo",
        myprops: "props",
        id:"l2"
    },
    attrs:{
        pop:"pop"
    }
}, "Go to Foo");
patch(container, v2)
*/
function clickHandler() {
    console.log('got clicked...')
}

const v3 = h('div#container.two.classes', {
    on: {
        click: clickHandler
    },
    hook: {
        init: function (vnode) {
            console.log('执行init调用...')
        }
    },
    is: true,
    class: {
        active: true,
        selected: true
    }
}, 'click me')


const v4 = h('div', {
    props: {
        id: 'box'
    }
}, {
    sel: "span",
    data: {
        style: {
            color: 'red'
        }
    },
    text: 'hello snabbdom'
})

const vnode1 = h('u1', {
    props:{
        id:"info"
    }
}, [
    h('li', {key: '1'}, '1'),
    h('li', {key: '2'}, '2'),
    h('li', {key: '3'}, '3'),
    h('li', {key: '4'}, '4'),
    h('li', {key: '5'}, '5')
])
patch(container, vnode1)

const vnode2 = h('u1', {
    props:{
        id:"info"
    },
    on:{
        click:function () {
            console.log('点击执行...')
        }
    }
}, [
    h('li', {key: '1'}, '1'),
    h('li', {key: '4'}, '4'),
    h('li', {key: '6'}, '6'),
    h('li', {key: '1000'}, '1000'),
    h('li', {key: '100'}, '100'),
    h('li', {key: '5'}, '5'),
])

const btn = document.getElementById('BtnChangeValue')
btn.onclick = function () {
    patch(vnode1, vnode2)
}
/*
const btn=document.getElementById('BtnChangeValue')
const newContainer=document.getElementById('container')
const v4=h('div#container.two.classes.active.selected',{},'hello snabbdom')
btn.onclick=function () {
    patch(newContainer,v4)
}*/
