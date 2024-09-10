const {ipcMain} = require("electron");
const {messageDecrypter, messageEncrypter, decodeHex} = require("./utils/cryptoUtils");
const path = require("path");
const {ipcMessage} = require("./utils/ipcUtils");
const {pluginLog} = require("./utils/logUtils")
const {Config}=require("./Config.js")

const pluginPath = path.join(LiteLoader.plugins.encrypt_chat.path.plugin);//插件目录
const configPath = path.join(pluginPath, "config.json");

const config = Config.config

// 运行在 Electron 主进程 下的插件入口

// 创建窗口时触发
module.exports.onBrowserWindowCreated = async window => {
    if (window.id !== 2) {
        pluginLog('当前窗口ID为' + window.id + '.退出')
        return
    }

    //window 为 Electron 的 BrowserWindow 实例
    pluginLog('启动！')
    await onload()
    pluginLog("main.js onLoad注入成功")

    //获取官方的消息监听器
    const ipcMessageProxy = window.webContents._events["-ipc-message"]
    pluginLog('ipc监听器获取成功')
    //创建一个自己的代理
    const proxyIpcMsg = new Proxy(ipcMessageProxy, {
        apply(target, thisArg, args) {
            //thisArg是WebContent对象
            //应用自己的ipcMessage方法
            ipcMessage(args).then(modifiedArgs => {
                return target.apply(thisArg, modifiedArgs)
            }).catch(err => {
                console.log(err)
                target.apply(thisArg, args)
            })
        }
    })

    //替换掉官方的监听器
    window.webContents._events["-ipc-message"] = proxyIpcMsg
    pluginLog('ipc监听器修改成功')
}

async function onload() {
    ipcMain.on("LiteLoader.encrypt_chat.setActiveEC", (_, activeState) => config.activeEC = activeState)
    ipcMain.handle("LiteLoader.encrypt_chat.messageEncrypter", (_, message) => messageEncrypter(message))
    ipcMain.handle("LiteLoader.encrypt_chat.messageDecrypter", (_, message) => messageDecrypter(message))
    ipcMain.handle("LiteLoader.encrypt_chat.decodeHex", (_, message) => decodeHex(message))
    ipcMain.handle("LiteLoader.encrypt_chat.getActiveEC", () => config.activeEC)
    ipcMain.handle("LiteLoader.encrypt_chat.getWindowID", (event) => event.sender.getOwnerBrowserWindow().id)
    //设置相关，给renderer进程用
    ipcMain.handle("LiteLoader.encrypt_chat.getConfig",()=>Config.getConfig())
    ipcMain.handle("LiteLoader.encrypt_chat.setConfig",(event,newConfig)=>Config.setConfig(newConfig))

    await Config.initConfig(pluginPath,configPath)
}


