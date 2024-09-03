const {ipcMain, dialog, shell, clipboard} = require("electron");
const {messageDecrypter,messageEncrypter, checkMsgElement, decodeHex} = require("./cryptoUtils");
const path = require("path");
// 运行在 Electron 主进程 下的插件入口

// 创建窗口时触发
module.exports.onBrowserWindowCreated = window => {
    // window 为 Electron 的 BrowserWindow 实例
    console.log('[Encrypt-Chat]'+'启动！')

    console.log('下面打印的是window.webContents._events["-ipc-message"]')
    console.log(window.webContents._events["-ipc-message"])//是一个匿名函数
    //获取官方的消息监听器
    const ipcMessageProxy=window.webContents._events["-ipc-message"]
    //创建一个自己的代理
    const proxyIpcMsg=new Proxy(ipcMessageProxy,{
        apply(target, thisArg, argumentsList) {

        }
    })
}

const srcPath=path.join(LiteLoader.path.plugins,"qq-anti-recall","")

ipcMain.handle("LiteLoader.encrypt_chat.messageEncrypter", (_, message) => messageEncrypter(message))
ipcMain.handle("LiteLoader.encrypt_chat.messageDecrypter", (_, message) => messageDecrypter(message))
ipcMain.handle("LiteLoader.encrypt_chat.decodeHex", (_, message) => decodeHex(message))
ipcMain.handle("LiteLoader.encrypt_chat.getMenuHTML",()=> fs.readFileSync(path.join(__dirname, "menu.html"), "utf-8"))

