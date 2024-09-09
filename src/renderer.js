import {addFuncBarIcon, addMenuItemEC} from "./utils/chatUtils.js";
import {SettingListeners} from "./utils/SettingListeners.js"
import {messageRenderer, patchCss} from "./utils/rendererUtils.js";
import {pluginMenuHTML} from "./menu.js";
const ecAPI=window.encrypt_chat
const nowConfig = await ecAPI.getConfig()

await onLoad();//注入


export const onSettingWindowCreated = view => {
    // view 为 Element 对象，修改将同步到插件设置界面
    // 这个函数导出之后在QQ设置里面可以直接看见插件页面

    try {
        //整个插件主菜单
        const parser = new DOMParser()
        const settingHTML = parser.parseFromString(pluginMenuHTML, "text/html").querySelector(".config-menu")

        const myListener = new SettingListeners(settingHTML)
        myListener.onLoad()

        view.appendChild(settingHTML);


        // myListener.onLoad()//调用监听器
    } catch (e) {
        setInterval(() => {
            console.log(e)
        }, 1000)
    }
}

//注入函数
async function onLoad() {
    const currentWindowID = await window.encrypt_chat.getWindowID()
    if (currentWindowID !== 2) {return}//ID二号是QQ主页面，不是就直接退出

    console.log('下面执行onLoad方法')
    addMenuItemEC()//添加鼠标右键时的菜单选项
    patchCss()//修改css
    addFuncBarIcon()//添加功能栏的功能图标
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
    await messageRenderer(allChats)
}




