function F() {

}

F.prototype = {
    id: "F",
    obj: {
        'name': "obj"
    },
    'ultra-test'() {
        console.log('ultra-test')
    }
}

var f = new F()
console.log(f.id)


f.obj = {
    'name': 'f'
}
console.log(f.obj === F.prototype.obj)

console.log(F.prototype.obj)

var f2 = new F()
console.log(f2.obj)
