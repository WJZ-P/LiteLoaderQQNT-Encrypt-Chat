const ecAPI = window.encrypt_chat

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
    console.log('现在执行addMenuItemEC方法')
    let isRightClick = false;
    let textElement = null;
    //监听鼠标点击，根据情况插入功能栏
    document.addEventListener("mouseup", (event) => {
        if (!textElement?.classList) return;//如果元素没有classList属性，直接返回，因为右键的不一定是文字元素

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
                `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#D9D9D9" onclick="">
<path d="M240-399h313v-60H240v60Zm0-130h480v-60H240v60Zm0-130h480v-60H240v60ZM80-80v-740q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H240L80-80Zm134-220h606v-520H140v600l74-80Zm-74 0v-520 520Z"/></svg>`,
                "开关加密聊天(备用)",
                async () => {
                    try {

                    } catch (e) {

                    }
                }
            );
        }
    }).observe(document.querySelector("body"), {childList: true});
}

/**
 * 被用于在addFuncBar的MutationObserver中调用,用于新建图标
 * @param chatElement
 */
function createFuncBarIcon(chatElement) {
    new MutationObserver(async () => {
        if (document.querySelector('#id-func-bar-EncryptChat')) return //已经有了就不添加了
        const funcBarElement = chatElement.getElementsByClassName("func-bar")[1]//第二个就是右边的
        // console.log('下面打印出右侧的funcbar')
        // console.log(funcBarElement)
        if (!funcBarElement) return//为空就返回，说明当前不是聊天窗口


        const barIconElement = funcBarElement.querySelector(`.bar-icon`).cloneNode(true)
        const iconItem = barIconElement.querySelector('.icon-item')//内部的元素，需要修改成自己的值
        const imageElement = barIconElement.querySelector('.q-svg-icon')//图片元素，innerHTML是一个svg元素，换成自己的
        const qToolTipsEl = barIconElement.querySelector('.q-tooltips')//提示元素，需要往里面加一个自己设置的子元素

        iconItem.id = "id-func-bar-EncryptChat"
        iconItem.ariaLabel = "加密聊天"
        imageElement.innerHTML = `<svg class="q-svg ec-svg" xmlns="http://www.w3.org/2000/svg" 
height="24px" viewBox="0 -960 960 960" width="24px" onclick="ECactivator(this,document.querySelector('.send-btn-wrap'))">
<path d="M240-399h313v-60H240v60Zm0-130h480v-60H240v60Zm0-130h480v-60H240v60ZM80-80v-740q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H240L80-80Zm134-220h606v-520H140v600l74-80Zm-74 0v-520 520Z"/></svg>`

        //下面把提示字添加到子元素内

        const tipElement = document.createElement('div')
        tipElement.className = 'q-tooltips__content q-tooltips__bottom q-tooltips-div';
        tipElement.style.cssText = 'bottom: -31px; transform: translateX(-50%); left: calc(50% + 0px);';
        // 创建内部内容,塞到这个新创建的子元素内
        const innerContent = document.createElement('div');
        innerContent.className = 'primary-content';
        innerContent.textContent = '开启/关闭消息加密';
        tipElement.appendChild(innerContent)

        // 将文字元素插入到提示元素内
        qToolTipsEl.appendChild(tipElement)


        //把自己的新图标元素添加进去，并且是添加成为第一个子元素，显示在最左边。
        funcBarElement.insertBefore(barIconElement, funcBarElement.firstChild);

        //检查一下目前的激活状态并对应修改
        if ((await ecAPI.getConfig()).activeEC) {
            imageElement.firstChild.classList.add('active')
            const sendBtnWrapEl = document.querySelector('.send-btn-wrap')
            sendBtnWrapEl.classList.toggle('active')
            const sendTextBtnEl = sendBtnWrapEl.querySelector('.send-msg')//带有“发送字样的按钮”
            sendTextBtnEl.innerText = "加密发送"

            if ((await ecAPI.getConfig()).isUseEnhanceArea)
                document.querySelector('.chat-input-area').classList.toggle('active')
        }
    }).observe(chatElement, {childList: true});//检测子元素的增删变化
}

/**
 * 为QQ添加一个EC的功能栏图标，位置在打字窗口的正上方
 */
export function addFuncBarIcon() {
    // console.log('addfuncbar启动辣！``````````````````````````````````````````````')

    let chatElement = null
    //let findCnt=0
    const taskID = setInterval(() => {
        if (!document.querySelector(".chat-input-area")) {
            return
        }
        //已经找到对应元素
        chatElement = document.querySelector(".chat-input-area")
        // console.log('找到啦！' + chatElement)

        createFuncBarIcon(chatElement)
        clearInterval(taskID)//关闭任务
    }, 500)
}

/**
 * 启用/关闭加密聊天功能，同时修改svg元素样式和输入框的样式
 * @param svg svg元素
 * @param sendBtnWrapEl
 */
export async function ECactivator(svg = null, sendBtnWrapEl = null) {
    let isActive = (await ecAPI.getConfig()).activeEC//获取当前EC状态，默认关闭加密
    console.log('更改active为' + !isActive)

    //没传入就自己找
    if (!svg) svg = document.querySelector('.ec-svg')
    if (!sendBtnWrapEl) sendBtnWrapEl = document.querySelector('.send-btn-wrap')

    sendBtnWrapEl.classList.toggle('active')
    const sendTextBtnEl = sendBtnWrapEl.querySelector('.send-msg')//带有“发送字样的按钮”
    sendTextBtnEl.innerText = !isActive ? "加密发送" : "发送"

    svg.classList.toggle('active');

    //对输入框加点特效，使得开启加密更加明显
    if ((await ecAPI.getConfig()).isUseEnhanceArea) {
        const chatInputEl = document.querySelector('.chat-input-area')
        chatInputEl.classList.toggle('active')
    }


    await ecAPI.setConfig({activeEC: !isActive})//设置开关状态

    //这里加点测试用功能
    // const multiForwardMsg = [{"frameId": 1, "processId": 5}, false, "IPC_UP_2", [{
    //     "type": "request",
    //     "callbackId": "24b46f24-8235-4cb6-a8ff-5acdd8435491",
    //     "eventName": "ns-ntApi-2"
    // }, ["nodeIKernelMsgService/multiForwardMsgWithComment", {
    //     "msgInfos": [{
    //         "msgId": "7418734961609529108",
    //         "senderShowName": "真漂亮"
    //     }, {"msgId": "7418734961609529103", "senderShowName": "真漂亮"}],
    //     "srcContact": {"chatType": 2, "peerUid": "934773893", "guildId": ""},
    //     "dstContact": {"chatType": 2, "peerUid": "934773893", "guildId": ""},
    //     "commentElements": [],
    //     "msgAttributeInfos": new Map()
    // }, null]]]

    // const result = await ecAPI.invokeNative("ns-ntApi", "nodeIKernelMsgService/multiForwardMsgWithComment"
    //     , false, window.webContentId, {
    //         "msgInfos": [{
    //             "msgId": "7418734961609529108",
    //             "senderShowName": "真漂亮"
    //         }, {"msgId": "7418734961609529103", "senderShowName": "真漂亮"}],
    //         "srcContact": {"chatType": 2, "peerUid": "934773893", "guildId": ""},
    //         "dstContact": {"chatType": 2, "peerUid": "545402644", "guildId": ""},
    //         "commentElements": [],
    //         "msgAttributeInfos": new Map()
    //     }, null)

}

window.ECactivator = ECactivator

//ecAPI.addEventListener('LiteLoader.encrypt_chat.changeAllECactivator',ECactivator)
//这样写会存在不同窗口的同步问题。