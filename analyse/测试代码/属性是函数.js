
var fn=function(){
    console.log("fn执行..")
}

let o={}
Object.defineProperty(o,"$isServer",{
    get:fn
})

let is=o.$isServer
