const {ipcMain, dialog, shell, clipboard} = require("electron");
const {messageDecoder,messageEncrypter, checkMsgElement, decodeHex} = require("./cryptoUtils");
// 运行在 Electron 主进程 下的插件入口

// 创建窗口时触发
module.exports.onBrowserWindowCreated = window => {
    // window 为 Electron 的 BrowserWindow 实例
    console.log('[Encrypt-Chat]'+'启动！')
}


ipcMain.handle("LiteLoader.encrypt_chat.messageEncrypter", (_, message) => messageEncrypter(message))
ipcMain.handle("LiteLoader.encrypt_chat.messageDecoder", (_, message) => messageDecoder(message))
ipcMain.handle("LiteLoader.encrypt_chat.decodeHex", (_, message) => decodeHex(message))