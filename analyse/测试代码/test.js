var o = {
    age: 20,
    _c: function (args) {
        console.log(`this的_c调用:${args}`)
    }
}

function f() {
}

var render = function () {
    with (this) {
        _c('div')
    }
}

render.call(o, f)

const children = currentParent.children
text = inPre || text.trim() ? isTextTag(currentParent) ? text : decodeHTMLCached(text)
//only preserve whitespace if its not right after a starting tag:preserveWhitespace &&children. length?'':''