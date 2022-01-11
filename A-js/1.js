function f(key) {
    this.key = key
}

f.prototype = {
    isValid() {
        console.log(this.key)
    }
}

let o = new f(20)
o.addSub()
