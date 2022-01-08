/*
    constructor需要修正

 */

let p2;
(function () {
    function Person(opt) {
        this.name = opt.name || "";
        this.age = opt.age || "";
    }

    Person.prototype.getName = function () {
        console.log(this.name);
    }
    p2 = new Person({name: "tianya", age: 17});
})()

p2.getName();
p2.constructor //Person()

/*
    例子：在闭包情况下为prototype添加方法
 */

p2.constructor.prototype.getAge = function () {
    return this.age
}

let age=p2.getAge()
console.log(age)