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
        .querySelector(`.q-context-menu :not([disabled="true"])`)
        .outerHTML.replace(/<!---->/g, "");

    const item = element.firstChild;
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
function addMenuItemEC() {

    let isRightClick = false;
    let textElement = null;
    //监听鼠标点击，根据情况插入功能栏
    document.addEventListener("mouseup", (event) => {
        if (event.button === 2) {//如果是鼠标右键
            isRightClick = true;
            textElement = event.target;
            if (
                textElement.classList.contains("message-content__wrapper") //这个类是包围着文字的气泡
                || textElement.classList.contains("msg-content-container") //这个类是里面的第一个子元素
            ) {
                //
            } else {
                textElement = null;
            }
        } else {
            isRightClick = false;
            textElement = null;
        }
    });
    new MutationObserver(() => {
        console.log('打印鼠标右键菜单')
        console.log(document.querySelector(".q-context-menu").innerHTML);

        const qContextMenu = document.querySelector(".q-context-menu");//右键菜单元素

        if (qContextMenu) {
            createMenuItemEC(
                qContextMenu,
                `
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
            <path d="M250-410h300v-60H250v60Zm0-120h460v-60H250v60Zm0-120h460v-60H250v60ZM100-118.46v-669.23Q100-818 121-839q21-21 51.31-21h615.38Q818-860 839-839q21 21 21 51.31v455.38Q860-302 839-281q-21 21-51.31 21H241.54L100-118.46ZM216-320h571.69q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-455.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H172.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v523.08L216-320Zm-56 0v-480 480Z"/></svg>
            `,
                "Encrypt-Chat设置",
                async () => {
                    try {
                        // var decoded = await decodeQRUrl(picSrc);
                        //
                        // await window.qr_decode.showResult(decoded);

                        console.log('MenuUtils的MutationObserver方法，未设置')
                    } catch (e) {
                        // console.log("[QR-Decode]", "解码失败", e);
                        // await window.qr_decode.showFailed(e);
                    }
                }
            );
        }
    }).observe(document.querySelector("body"), {childList: true});
}

export function test123(){}

export {createMenuItemEC, addMenuItemEC};
