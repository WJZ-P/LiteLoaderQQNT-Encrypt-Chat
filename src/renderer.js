import {addMenuItemEC} from "./MenuUtils.js";

addMenuItemEC()//添加鼠标右键时的菜单选项
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
        if (!(await checkMsgElement(innerChatElement))) continue; //如果消息元素不符合加密解密条件，则不修改

        const msg = innerChatElement.innerText  //发送的消息内容
        const decryptedMsg =await window.encrypt_chat.messageDecoder(msg) //解密消息
        innerChatElement.innerText += `(${decryptedMsg})`

    }
}

/**
 * 检查消息元素是否需要修改，不能进程间通讯，因为只能传朴素值
 * @param msgElement
 * @returns {boolean}
 */
async function checkMsgElement(msgElement) {
    const result = !(!msgElement?.classList || msgElement?.innerText ||
        msgElement?.classList.contains('changed-text') //已修改则不再修改
        || '' ===(await window.encrypt_chat.decodeHex(msgElement.innerText))); //未加密消息不修改
    if (!result && msgElement?.innerText) {
        console.log('[EC]' + '这条消息不对哦，消息内容为' + msgElement?.innerText)
        console.log('[EC]' + 'decodeHex解码结果为' + (await window.encrypt_chat.decodeHex(msgElement.innerText)))
    }
    return result
}