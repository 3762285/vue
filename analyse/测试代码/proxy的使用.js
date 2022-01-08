/*
    标题: Proxy的总结
    作者: 天涯
    时间: 2021-10-27号
 */


var o = {
    age: 20,
    address: "广州",
    A: 'a',
    B: 'b',
    C: function () {
        console.log('执行C调用...')
    }
}
// Proxy: ES6新增语法
var proxy = new Proxy(o, {
    has(target, key) {
        console.log(`has被调用,传入key=${key}`)
        return target[key]
    }
})

/*
    @f(proxy)
    说明:
        with(proxy){..}:将proxy作用域提升到此处
        当遇到陌生的变量时,就会问:此变量是proxy的属性吗? 因此，就会调用proxy的has拦截方法，查询是否有？这么理解逻辑就合理了！
        因此,在下面的代码中每遇到一个变量都会执行一次查询(has方法)
 */
function f(proxy) {
    with (proxy) {
        let c = A
        let b = B
        C()
    }
}

f(proxy)

/*

 */
