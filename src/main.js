const {ipcMain, dialog, shell, clipboard} = require("electron");
const {messageDecrypter, messageEncrypter, checkMsgElement, decodeHex} = require("./cryptoUtils");
const path = require("path");

const state = {
    activeEC: false
}

// 运行在 Electron 主进程 下的插件入口

// 创建窗口时触发
module.exports.onBrowserWindowCreated = window => {
    // window 为 Electron 的 BrowserWindow 实例
    console.log('[Encrypt-Chat]' + '启动！')

    console.log('下面打印的是window.webContents._events')
    console.log(window.webContents._events)//是一个匿名函数
    //获取官方的消息监听器
    const ipcMessageProxy = window.webContents._events["-ipc-message"]
    //创建一个自己的代理
    const proxyIpcMsg = new Proxy(ipcMessageProxy, {
        apply(target, thisArg, args) {
            ipcMessage(args).then(result => {
                return target.apply(thisArg, result)
            }).catch(err => {
                console.log('err', err)
                target.apply(thisArg, args)
            })
        }
    })

    //替换掉官方的监听器
    window.webContents._events["-ipc-message"] = proxyIpcMsg
}

const srcPath = path.join(LiteLoader.path.plugins, "qq-anti-recall", "")


ipcMain.on("LiteLoader.encrypt_chat.setActiveEC", (_, activeState) => {
    state.activeEC = activeState
})
ipcMain.handle("LiteLoader.encrypt_chat.messageEncrypter", (_, message) => messageEncrypter(message))
ipcMain.handle("LiteLoader.encrypt_chat.messageDecrypter", (_, message) => messageDecrypter(message))
ipcMain.handle("LiteLoader.encrypt_chat.decodeHex", (_, message) => decodeHex(message))
ipcMain.handle("LiteLoader.encrypt_chat.getActiveEC", (_) => state.activeEC)


async function ipcMessage(args) {
    //判断是否是nodeIKernelMsgService/sendMsg事件
    if (!args?.[3]?.[1]?.[0] || args[3][1][0] !== 'nodeIKernelMsgService/sendMsg') return args;

    console.log('下面打印出nodeIKernelMsgService/sendMsg的内容')
    console.log(args[3][1][1])
    console.log('下面打印出具体的textElement')
    console.log(args[3][1][1].msgElements?.[0].textElement)

    //下面判断加密是否启用，启用了就修改
    const originalContent = args[3][1][1].msgElements?.[0].textElement.content
    if (state.activeEC) {
        //修改原始消息
        args[3][1][1].msgElements[0].textElement.content = messageEncrypter(originalContent)
    }

    return args
}
