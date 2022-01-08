const levels = {
    "h1": 0,
    "h2": 0,
    "h3": 0,
    "h4": 0,
    "h5": 0,
    "h6": 0
}
const Nav = {
    getElementPos(el) {//获取元素位置，距浏览器左边界的距离（left）和距浏览器上边界的距离（top）
        let top = 0
        let left = 0
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

        let curPos = Nav.getScrollBarPos()//获取滚动条当前位置

        let dest = 0;
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
        const body = document.getElementById(id) //获取博文正文div容器
        if (!body)
            return false

        const sidebar = document.createElement('div');//创建右侧目录的div容器
        sidebar.classList.add('sidebar')

        const title = document.createElement('h2'); //title --> sidebar
        title.innerText = '目录'
        sidebar.appendChild(title);

        const content = document.createElement('div') //content --> sidebar
        content.setAttribute('id', 'toc')
        sidebar.appendChild(content)


        const list = document.createElement("div") //创建自定义列表
        list.classList.add('nav-list')
        content.appendChild(list) // list --> content

        let num = 0;//统计找到符合条件的
        //let nodes = body.getElementsByTagName("*");//获取div中所有元素结点
        let nodes = body.querySelectorAll(params)

        for (let i = 0; i < nodes.length; i++) {
            let title = nodes[i].innerHTML.replace(/<\/?[^>]+>/g, "");//innerHTML里面的内容可能有HTML标签，所以用正则表达式去除HTML的标签
            title = Nav.decode(title);

            let wrap = document.createElement("div") //右侧单条导航
            wrap.classList.add(`${nodes[i].nodeName}`.toLowerCase())
            levels[nodes[i].nodeName]++;

            for (let l in levels) {
                if (l > nodes[i].nodeName) {
                    levels[l] = 0;
                }
            }

            let header = [];
            if (nodes[i].nodeName != "h1") {
                for (let l in levels) {
                    if (l <= nodes[i].nodeName) {
                        header.push(levels[l])
                    }
                }
                title = `${header.join(".")} ${title}`
            } else {
                title = `${levels["h1"]} ${title}`
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

        if (num == 0)
            return false;

        content.appendChild(Nav.scroll())
        document.body.appendChild(sidebar);
    },
    scroll() {
        let el = document.createElement("div")
        let totop = document.createElement('span')
        totop.classList.add('back_to_top')
        totop.innerText = "↑返回顶端</span>"
        totop.addEventListener('click', function (event) {
            document.body.scrollTop = document.documentElement.scrollTop = 0
            event.stopPropagation()
            return false
        })

        let a = document.createElement('a')
        let href = document.querySelectorAll('.postfoot a[href^="https://i.cnblogs.com/EditPosts.aspx"]')[0].href
        a.href = href
        a.innerText = '编辑'

        el.appendChild(totop)
        el.appendChild(a)

        return el
    }
};
window.addEventListener('load', function () {
    Nav.create("cnblogs_post_body", 0, "h1", "h2", "h3", "h4", "h5", "h6");
})
