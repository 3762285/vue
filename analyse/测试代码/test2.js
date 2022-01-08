var sharedPropertyDefinition={
    enumerable:true,
    configurable:true,
    get:function () {},
    set:function () {}
}

function proxy(target,sourceKey,key) {
    sharedPropertyDefinition.get=function proxyGetter() {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set=function proxySetter(val) {
        this[sourceKey][key]=val
    }
    Object.defineProperty(target,key,sharedPropertyDefinition)
}

let o={
    '$options':{
        age:20
    }
}
proxy(o,'$options','age')
console.log(o.age)

var compiled={
    ast:ast,
    render:code.render,
    staticRenderFns:code.staticRenderFns,
    errors:errors,
    tips:tips
}