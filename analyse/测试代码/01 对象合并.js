/*
    说明：主要分析源码1220行,function mergeData(to, from){..}
    将对象from和to进行合并并返回to
    总结：凡是from中有而to没有的,就合并过来
*/

let o1 = {
    name: 'vue',
    author: {
        name: 'you',
        age: 18
    },
    home: 'China'
}

let o2 = {
    name: 'react',
    author: {
        name: 'facebook',
        age: 30
    },
    version: 12
}

mergeData(o1, o2)
console.log(o1)

//结果
/**
 {
  author: {name: "you", age: 18}
  home: "China"
  name: "vue"
  version: 12
}
 **/

new Vue({
    data: {
        count: 1
    },
    watch: {
        count: "handleCountChange"
    },
    methods: {
        handleCountChange(val) {
            console.log('count改变了')
        }
    }
})

