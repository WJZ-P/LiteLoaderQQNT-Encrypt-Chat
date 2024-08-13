//代码参考自https://github.com/xh321/LiteLoaderQQNT-QR-Decode

/**
 * 右键菜单插入功能方法，
 * @param {Element} rightClickMenu 右键菜单元素
 * @param {String} icon SVG字符串
 * @param {String} title 选项显示名称
 * @param {Function} callback 回调函数
 */
function createMenuItemEC(rightClickMenu, icon, title, callback) {
    if (rightClickMenu.querySelector("#menuItem-EC") != null) return;//如果已经有了就不加了直接

    const element = document.createElement("div");//复制本来的右键菜单栏
    element.innerHTML = document
        .querySelector(`.q-context-menu`)
        .outerHTML.replace(/<!---->/g, "");
    // console.log('EC-createMenuItemEC中创建的element如下')
    // console.log(element)
    //这里做了改动，以前是直接用的firstChild，但是新版QQ右键菜单栏第一个子元素是一行表情
    const item = element.querySelector(".q-context-menu-item")
    // console.log(item)
    item.id = "menu-item-EC";
    if (item.querySelector(".q-icon")) {
        item.querySelector(".q-icon").innerHTML = icon;
    }
    if (item.classList.contains("q-context-menu-item__text")) {
        item.innerText = title;
    } else {
        item.querySelector(".q-context-menu-item__text").innerText = title;
    }
    item.addEventListener("click", () => {
        callback();
        rightClickMenu.remove();
    });
    rightClickMenu.appendChild(item);
}

/**
 * 右键菜单监听
 */
export function addMenuItemEC() {

    let isRightClick = false;
    let textElement = null;
    //监听鼠标点击，根据情况插入功能栏
    document.addEventListener("mouseup", (event) => {
        if(!textElement?.classList) return;//如果元素没有classList属性，直接返回，因为右键的不一定是文字元素

        if (event.button === 2) {//如果是鼠标右键
            isRightClick = true
            let targetClasses = ["message-content__wrapper", "msg-content-container", "message-content", "text-element"]
            if (targetClasses.some(className => textElement.classList.contains(className))) //如果是聊天窗口中的文字)
            {
                textElement = event.target;
                console.log('EC-目标类名判断成功！')
            } else {
                textElement = null;
            }
        } else {
            isRightClick = false;
            textElement = null;
        }
    });
    new MutationObserver(() => {
        // console.log('EC-打印鼠标右键菜单')
        // console.log(document.querySelector(".q-context-menu").outerHTML);

        const qContextMenu = document.querySelector(".q-context-menu");//右键菜单元素

        if (qContextMenu) {
            createMenuItemEC(
                qContextMenu,
                `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#D9D9D9"><path d="M240-399h313v-60H240v60Zm0-130h480v-60H240v60Zm0-130h480v-60H240v60ZM80-80v-740q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H240L80-80Zm134-220h606v-520H140v600l74-80Zm-74 0v-520 520Z"/></svg>`,
                "Encrypt-Chat",
                async () => {
                    try {
                        console.log('MenuUtils的MutationObserver方法，未设置')
                    } catch (e) {

                    }
                }
            );
        }
    }).observe(document.querySelector("body"), {childList: true});
}

