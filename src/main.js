const {ipcMain, dialog, shell, clipboard} = require("electron");
const {messageDecrypter,messageEncrypter, checkMsgElement, decodeHex} = require("./cryptoUtils");
const path = require("path");
// 运行在 Electron 主进程 下的插件入口

// 创建窗口时触发
module.exports.onBrowserWindowCreated = window => {
    // window 为 Electron 的 BrowserWindow 实例
    console.log('[Encrypt-Chat]'+'启动！')
}

const srcPath=path.join(LiteLoader.path.plugins,"qq-anti-recall","")

ipcMain.handle("LiteLoader.encrypt_chat.messageEncrypter", (_, message) => messageEncrypter(message))
ipcMain.handle("LiteLoader.encrypt_chat.messageDecrypter", (_, message) => messageDecrypter(message))
ipcMain.handle("LiteLoader.encrypt_chat.decodeHex", (_, message) => decodeHex(message))

ipcMain.handle("LiteLoader.encrypt_chat.getMenuHTML",()=> fs.readFileSync(path.join(__dirname, "menu.html"), "utf-8"))