import {addFuncBarIcon, addMenuItemEC} from "./utils/chatUtils.js";
import {SettingListeners} from "./utils/SettingListeners.js"
import {messageRenderer, patchCss} from "./utils/rendererUtils.js";
import {pluginMenuHTML} from "./menu.js";
import {imgViewHandler} from "./utils/imgViewerUtils.js";


const ecAPI = window.encrypt_chat
await onLoad();//注入

ecAPI.addEventListener('LiteLoader.encrypt_chat.ECactivator', window.ECactivator);


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
        setInterval(() => {//防止调试未打开就已经输出，导致捕获不到错误
            console.log(e)
        }, 1000)
    }
}

//注入函数
async function onLoad() {
    const currentWindowID = await ecAPI.getWindowID()
    // console.log('当前窗口ID为' + currentWindowID)

    if (currentWindowID !== 2) {
        return
    }//ID二号是QQ主页面，不是就直接退出

    console.log('[EC]下面执行onLoad方法')
    try {
        addMenuItemEC()//添加鼠标右键时的菜单选项
        patchCss()//修改css
        addFuncBarIcon()//添加功能栏的功能图标

    } catch (e) {
        console.log(e)
    }
}

//下面的方案有bug,MutationObserver有概率不触发，所以选择直接写死循环

// //节流，防止多次渲染
// let observerRendering = false
// //聊天窗口监听器
// const chatObserver = new MutationObserver(mutationsList => {
//     if (observerRendering) return;
//
//     observerRendering = true
//     setTimeout(async () => {
//         await render()
//         observerRendering = false
//     }, 50)
// })
//
// //聊天列表，所有聊天都显示在这里
// const finder = setInterval(async () => {
//     if (document.querySelector(".ml-list.list")) {
//         clearInterval(finder);
//         console.log("[Encrypt-Chat]", "已检测到聊天区域");
//         const targetNode = document.querySelector(".ml-list.list");
//         //只检测childList就行了
//         const config = {attributes: false, childList: true, subtree: false,};
//         chatObserver.observe(targetNode, config);
//
//     } else if (document.querySelector('.main-area__image')) {//有这个元素，说明当前窗口是imgViewer
//         console.log("[Encrypt-Chat]", "已检测到imgViewerWindow");
//         await render()
//         clearInterval(finder)
//     }
// }, 100);

render()    //这里绝对不能加await!否则会导致设置界面左侧的插件设置全部消失！！
//
//渲染函数
async function render() {
    try {
        while (true) {
            await sleep(100)
            setTimeout(async () => {
                //console.log('[Encrypt-Chat]' + '准备加载render方法(renderer进程)')
                const allChats = document.querySelectorAll('.ml-item')
                if (allChats) await messageRenderer(allChats)

                const imgViewerElement = document.querySelector('.main-area__image')
                if (imgViewerElement) await imgViewHandler(imgViewerElement)
            }, 50)
        }
    } catch (e) {
        console.log(e)
    }
}


export async function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}