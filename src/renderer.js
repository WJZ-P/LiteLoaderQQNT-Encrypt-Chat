import {addMenuItemEC} from "./MenuUtils.js";

let nowConfig = {
    mainColor: '#66ccff',
    enableTip: true
}

onLoad();//注入函数


function onLoad() {
    addMenuItemEC()//添加鼠标右键时的菜单选项
    patchCss()//修改css
}


export const onSettingWindowCreated = view => {
    // view 为 Element 对象，修改将同步到插件设置界面
    // 这个函数导出之后在QQ设置里面可以直接看见插件页面
    // 创建一个新的 div 元素
    const div = document.createElement('div');
    div.textContent = '嘻嘻哈哈，哇嘎哇嘎';

    // 将 div 元素添加到 view 对象中
    view.appendChild(div);
}

//节流，防止多次渲染
let observerRendering = false
//聊天窗口监听器
const chatObserver = new MutationObserver(mutationsList => {
    if (observerRendering) return;

    observerRendering = true
    setTimeout(async () => {
        await render()
        observerRendering = false
    }, 50)

})

//聊天列表，所有聊天都显示在这里
const finder = setInterval(() => {
    if (document.querySelector(".ml-list.list")) {
        clearInterval(finder);
        console.log("[Encrypt-Chat]", "已检测到聊天区域");
        const targetNode = document.querySelector(".ml-list.list");
        //只检测childList就行了
        const config = {attributes: false, childList: true, subtree: false,};
        chatObserver.observe(targetNode, config);
    }
}, 100);

//渲染函数，修改文本
async function render() {
    //console.log('[Encrypt-Chat]'+'尝试渲染消息')
    let allChats = document.querySelectorAll('.ml-item')

    //下面对每条消息进行判断
    for (let chatElement of allChats) {
        const innerChatElement = chatElement.querySelector('.text-normal')
        //包裹住消息内容的div msg-content-container
        const msgContentContainer = chatElement.querySelector('.msg-content-container')

        if (!(await checkMsgElement(innerChatElement))) continue; //如果消息元素不符合加密解密条件，则不修改

        const msg = innerChatElement.innerText  //发送的消息内容

        //解密消息
        innerChatElement.innerText = await window.encrypt_chat.messageDecoder(msg)//文本内容修改为解密结果
        innerChatElement.classList.add('message-encrypted') //标记已修改
        appendEncreptedTag(msgContentContainer,msg)//添加解密消息标记
    }
}

/**
 * 检查消息元素是否需要修改，不能进程间通讯，因为只能传朴素值
 * @param msgElement
 * @returns {boolean}
 */
async function checkMsgElement(msgElement) {
    //console.log('[EC]'+'消息内容为'+msgElement?.innerHTML)
    if (!msgElement?.classList) return false; //如果元素没有classList属性，直接返回，因为右键的不一定是文字元素
    if (msgElement.classList.contains('message-encrypted')) return false; //已修改则不再修改
    if (!msgElement?.innerText) return false; //如果消息为空，则不修改

    let decodeRes = await window.encrypt_chat.decodeHex(msgElement.innerText)//解码消息
    if (!decodeRes) return false; //如果消息解码失败，则不修改
    return true
}

//添加css样式
function patchCss() {
    console.log('[Encrypt-Chat]' + 'css加载中')

    let style = document.createElement('style')
    style.type = "text/css";
    style.id = "encrypt-chat-css";

    let sHtml = `.message-content__wrapper {
                    color: var(--bubble_guest_text);
                    display: flex;
                    grid-row-start: content;
                    grid-column-start: content;
                    grid-row-end: content;
                    grid-column-end: content;
                    max-width: -webkit-fill-available;
                    min-height: 38px;
                    overflow: visible !important;
                    border-radius: 10px; 
                  }
                  
            .message-encrypted-tip {
                position: absolute;
                top: calc(100% + 6px);
                right: 0;
                font-size: 12px;
                white-space: nowrap;
                color: var(--text-color);
                background-color: var(--background-color-05);
                backdrop-filter: blur(28px);
                padding: 4px 8px;
                margin-bottom: 2px;
                border-radius: 6px;
                box-shadow: var(--box-shadow);
                transition: 300ms;
                transform: translateX(-30%);
                opacity: 0;
                pointer-events: none;
                color:${nowConfig.mainColor};
            }
            
            .message-encrypted-tip-parent {
                    border-radius: 10px;
                    position: relative;
                    overflow: unset !important;
                    margin-top:3px;
                    margin-left:3px;
                    margin-right:3px;
                    margin-bottom: 25px;
                    box-shadow: 0px 0px 8px 5px ${nowConfig.mainColor};
            }`

    style.innerHTML = sHtml
    document.getElementsByTagName('head')[0].appendChild(style)
    console.log('[Encrypt-Chat]' + 'css加载完成')
}

//添加解密标记
function appendEncreptedTag(msgElement,originaltext) {
    console.log('[appendTag]'+'开始判断')
    //先判断是否符合条件
    if (msgElement.querySelector('.message-encrypted-tip') != null) return;//有标记就不用加
    if (!nowConfig.enableTip) return;//没开这个设置就不添加解密标记
    console.log('[appendTag]'+'判断成功，准备加tag')

    const tipElement = document.createElement('div')
    tipElement.innerText = '原信息：'+originaltext
    tipElement.classList.add('message-encrypted-tip')//添加tip类名
    msgElement.classList.add('message-encrypted-tip-parent')//调整父元素的style
    msgElement.appendChild(tipElement)

    setTimeout(() => {
        tipElement.style.transform = "translateX(0)";
        tipElement.style.opacity = "0.8";
    }, 10);

}