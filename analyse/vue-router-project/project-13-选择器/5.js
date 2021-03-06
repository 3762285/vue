let levels = {
    "H1": 0,
    "H2": 0,
    "H3": 0,
    "H4": 0,
    "H5": 0,
    "H6": 0
}
let Nav = {
    getElementPos(el) {//获取元素位置，距浏览器左边界的距离（left）和距浏览器上边界的距离（top）
        var top = 0
        var left = 0
        while (el) {
            top += el.offsetTop
            left += el.offsetLeft
            el = el.offsetParent
        }
        return {top, left}
    },

    /*
    获取滚动条当前位置
    */
    getScrollBarPos() {
        return document.body.scrollTop || document.documentElement.scrollTop
    },

    /*
    移动滚动条，finalPos 为目的位置，internal 为移动速度
    */
    moveScrollBar(finalPos, interval) {
        if (!window.scrollTo) {//若不支持此方法，则退出
            return false;
        }

        window.onmousewheel = function () {//窗体滚动时，禁用鼠标滚轮
            return false;
        }

        if (document.body.movement) {//清除计时
            clearTimeout(document.body.movement);
        }

        var curPos = Nav.getScrollBarPos()//获取滚动条当前位置

        var dest = 0;
        if (curPos == finalPos) {//到达预定位置，则解禁鼠标滚轮，并退出
            window.onmousewheel = function () {
                return true
            }
            return true;
        }
        if (curPos < finalPos) {//未到达，则计算下一步所要移动的距离
            dest = Math.ceil((finalPos - curPos) / 10);
            curPos += dest;
        }
        if (curPos > finalPos) {
            dest = Math.ceil((curPos - finalPos) / 10);
            curPos -= dest;
        }

        let scrollTop = Nav.getScrollBarPos();//获取滚动条当前位置
        window.scrollTo(0, curPos)

        if (Nav.getScrollBarPos() == scrollTop)//若已到底部，则解禁鼠标滚轮，并退出
        {
            window.onmousewheel = function () {
                return true;
            }
            return true;
        }
        document.body.movement = setTimeout(`Nav.moveScrollBar(${finalPos},${interval})`, interval)
    },

    decode(text) {
        var tmp = document.createElement("div")
        tmp.innerHTML = text
        var output = tmp.innerText || tmp.textContent
        tmp = null
        return output
    },

    /*
    创建博客目录，
    id表示包含博文正文的 div 容器的 id，
    mt 和 st 分别表示主标题和次级标题的标签名称（如 H2、H3，大写或小写都可以！），
    interval 表示移动的速度
    */

    /*tinaluo根据代码重构，理论支持无限级 2021-02-13号 夜 */
    create(id, interval, ...params) {
        let article = document.getElementById(id) //获取博文正文div容器
        if (!article)
            return false

        let sidebar = document.createElement('div');//创建右侧目录的div容器
        sidebar.className = 'sidebar';

        let title = document.createElement('h2'); //title --> sidebar
        title.innerText = '目录'
        sidebar.appendChild(title);

        let contents = document.createElement('div') //content --> sidebar
        contents.setAttribute('id', 'sideBarContents')
        sidebar.appendChild(contents)


        let list = document.createElement("div") //创建自定义列表
        contents.appendChild(list) // list --> content

        let num = 0;//统计找到符合条件的
        let nodes = article.getElementsByTagName("*");//获取div中所有元素结点

        for (let i = 0; i < nodes.length; i++) {
            if (params.find(e => e == nodes[i].nodeName) != undefined) {
                let title = nodes[i].innerHTML.replace(/<\/?[^>]+>/g, "");//innerHTML里面的内容可能有HTML标签，所以用正则表达式去除HTML的标签
                title = Nav.decode(title);

                let wrap = document.createElement("div") //右侧单条导航
                wrap.classList.add(`nav_${nodes[i].nodeName}`, 'nav')
                levels[nodes[i].nodeName]++;

                for (let l in levels) {
                    if (l > nodes[i].nodeName) {
                        levels[l] = 0;
                    }
                }

                let header = [];
                if (nodes[i].nodeName != "H1") {
                    for (let l in levels) {
                        if (l <= nodes[i].nodeName) {
                            header.push(levels[l])
                        }
                    }
                    title = `${header.join(".")} ${title}`
                } else {
                    title = `${levels["H1"]} ${title}`
                }

                let $title = document.createTextNode(title) //创建导航文本
                wrap.appendChild($title);
                wrap.addEventListener('click', function (e) {
                    let pos = Nav.getElementPos(nodes[i]);
                    if (!Nav.moveScrollBar(pos.top, interval))
                        return false;
                })

                list.appendChild(wrap);
                num++;
            }
        }

        if (num == 0)
            return false;

        contents.appendChild(Nav.scroll())
        document.body.appendChild(sidebar);
    },
    scroll() {
        let el = document.createElement("div")
        el.classList.add('roll_to_top', 'pointer')
        el.innerHTML = `<span>↑返回顶端</span>`
        el.addEventListener('click', function (e) {
            document.body.scrollTop = document.documentElement.scrollTop = 0
        })
        return el
    }
};
window.addEventListener('load', function () {
    Nav.create("cnblogs_post_body", 0, "H1", "H2", "H3", "H4", "H5", "H6");
})
