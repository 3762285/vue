/*

    get和value的区别

    value可以理解为给对象的某个属性赋值,如下:
 */

let o = {
    age: 20
}
Object.defineProperty(o, "age", {
    value: 30
})
console.log(o.age)
/*
    上述操作相当于：
    o.value = 30

    可以看出,value和get似乎意思相同,但也有点区别: get可以在返回值前进行其它操作，但value只能返回值！
 */

//下面是对象的属性做为方法的使用，与普通属性几乎完全一样，例如：
let o2 = {}
Object.defineProperty(o2, "count", {
    value: function matator() {
        console.log('count方法执行,只做简单的示例...')
    }
})

o2.count()

//上述有什么意义呢? 在Vue源码中有使用到

