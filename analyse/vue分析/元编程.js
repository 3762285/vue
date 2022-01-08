function DS(computorId) {
    this.computorId = computorId;
    //不同的电脑有不同的配置。
    this.data = {
        mouseInfo: "鼠标",
        mousePrice: "999",
        keyboardinfo: "键盘",
        keyboardprice: "888",

        lcdInfo: "驱动",

        lcdPrice: "888"

        /*
         *略去其他音响，声卡，先卡等属性
         */
    }
}

//DS 您可以当做数据库系统，或者前端开发过程中你也可以当做后台返回的json数据。
DS.prototype = {
    constructor: DS,
    get_mouse_info: function () {
        return this.data.mouseInfo;
    }, //取回鼠标信息
    get_mouse_price: function () {
        return this.data.mousePrice;
    }, //取回鼠标价格
    get_keyboard_info: function () {
        return this.data.keyboardinfo;
    },//取回键盘信息    get_keyboard_price : function() { return this.data.keyboardprice; }//取回键盘信息

    /*
     *还有其他一些关于显示器，音响，声卡等等信息和价格
     */
}
var Computer = function (allMethod) {
    var AimClass = function (id, data_source) {
        this.id = id;
        this.data_source = data_source;
    }
    AimClass.define_component = function (name) {
        var name = name,
            fnBody = 'var methodName = "get_' + name + '",' +
                'info = this.data_source[ methodName + "_info" ]( this.id ),' +
                'price = this.data_source[ methodName + "_price" ]( this.id ),' +
                'result = "mouse:" + info + price;' +
                'reuslt = price >= 100? "*" + result : result;' +
                'return reuslt;'
        this.prototype[name] = new Function('name', fnBody);
    }
    for (var i in allMethod) { //javascript对象内省机制。这种机制，解放了你的双手。不需要重复工作。不需要重复调用动态创建实例方法的类方法
        var reg = /^get_(.+)_info$/, str = '';
        if (allMethod.hasOwnProperty(i) && ((typeof allMethod[i]) == 'function') && (i != 'constructor')) {
            str = i.replace(reg, '$1');
            AimClass.define_component(str);
        }
    }
    return AimClass;
}(DS.prototype) //把DS的所有方法穿入当参数。
var obj = new DS('15');
var comObj = new Computer(12, obj);
console.log(comObj);
console.log(comObj.keyboard());