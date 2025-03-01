import {addFuncBarIcon, addMenuItemEC, changeECStyle, ECactivator} from "./utils/chatUtils.js";
import {SettingListeners} from "./utils/SettingListeners.js"
import {messageRenderer, patchCss, rePatchCss, listenMediaListChange} from "./utils/rendererUtils.js";

const ecAPI = window.encrypt_chat
await onLoad();//注入


//render()    //这里绝对不能加await!否则会导致设置界面左侧的插件设置全部消失！！

export const onSettingWindowCreated = async view => {
    // view 为 Element 对象，修改将同步到插件设置界面
    // 这个函数导出之后在QQ设置里面可以直接看见插件页面

    try {
        //整个插件主菜单
        const parser = new DOMParser()
        const settingHTML = parser.parseFromString(await ecAPI.getMenuHTML(), "text/html").querySelector("plugin-menu")

        const myListener = new SettingListeners(settingHTML)
        await myListener.onLoad()
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
    console.log('[EC渲染进程]正在调用onLoad函数~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    if (location.hash === "#/blank") {
        navigation.addEventListener("navigatesuccess", onHashUpdate, {once: true});
    } else {
        onHashUpdate();
    }
    console.log('[EC渲染进程]onLoad函数加载完成')
}

function onHashUpdate() {
    const hash = location.hash;
    if (hash === '#/blank') return;

    // 聊天页面
    if (hash.includes("#/main/message") || hash.includes("#/chat")) {
        handleMainPage();
        return;
    }

    // 图片查看器
    if (hash.includes("#/image-viewer")) {
        handleImageViewer();
        return;
    }
}

// 针对聊天页面的处理
function handleMainPage() {
    console.log('[EC渲染进程]执行onHashUpdate~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

    ecAPI.addEventListener('LiteLoader.encrypt_chat.rePatchCss', rePatchCss) //监听设置被修改后，从主进程发过来的重新修改css请求
    ecAPI.addEventListener('LiteLoader.encrypt_chat.changeECStyle', changeECStyle) //改变svg图标样式

    try {
        //addMenuItemEC()//添加鼠标右键时的菜单选项
        patchCss()//修改css
        addFuncBarIcon()//添加功能栏的功能图标

        //给document添加监听器快捷键。
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.code === 'KeyE' && document.hasFocus()) ECactivator()
        });

    } catch (e) {
        console.log(e)
    }

    mainRender()
}

// 聊天渲染器
async function mainRender() {
    try {
        while (true) {
            await sleep(100)//稍微调大点
            setTimeout(async () => {
                //console.log('[Encrypt-Chat]' + '准备加载render方法(renderer进程)')
                const allChats = document.querySelectorAll('.ml-item')
                if (allChats) await messageRenderer(allChats)

            }, 50)
        }
    } catch (e) {
        console.log(e)
    }
}


// 针对图片查看器的处理
function handleImageViewer() {
    // 图片查看器
    console.log('[EC渲染进程]执行onHashUpdate~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

    // 监听图片查看MediaList的变化，动态解密图片
    listenMediaListChange();
}



export async function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
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
