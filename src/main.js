const {ipcMain, globalShortcut} = require("electron");
const {messageDecrypter, messageEncrypter, decodeHex} = require("./utils/cryptoUtils");
const path = require("path");
const {ipcMessageHandler} = require("./utils/ipcUtils");
const {pluginLog} = require("./utils/logUtils")
const {Config} = require("./Config.js")
const {imgDecryptor, imgChecker} = require("./utils/imageUtils");

const pluginPath = path.join(LiteLoader.plugins.encrypt_chat.path.plugin);//插件目录
const configPath = path.join(pluginPath, "config.json");

const config = Config.config

// 运行在 Electron 主进程 下的插件入口

// 创建窗口时触发
module.exports.onBrowserWindowCreated = async window => {
    // pluginLog('当前窗口的title如下：')
    // console.dir(window, { showHidden: true });   //打印出窗口的所有信息
    // pluginLog(window.title)                      //恒为QQ
    // pluginLog(window.accessibleTitle)            //空的
    // pluginLog(window.representedFilename)        //空的
    // pluginLog('当前窗口的contentView如下：')
    // console.log(window.contentView)                 //一个空对象{}

    // pluginLog('当前窗口的webContents如下：')
    // console.log(window.webContents)

    pluginLog('[主进程]当前窗口ID ' + window.id)
    // 监听窗口加载完成事件
    // const currentURL = window.webContents.getURL();
    // pluginLog('当前加载的 URL:', currentURL);


    //是主窗口才修改
    if (window.id === 2) {
        try {
            //window 为 Electron 的 BrowserWindow 实例
            pluginLog('启动！')
            await onload()
            pluginLog("main.js onLoad注入成功")

            //获取官方的消息监听器
            const ipcMessageProxy = window.webContents._events["-ipc-message"]
            pluginLog('ipc监听器获取成功')

            //替换掉官方的监听器
            window.webContents._events["-ipc-message"] = new Proxy(ipcMessageProxy, {
                apply(target, thisArg, args) {
                    //thisArg是WebContent对象
                    //应用自己的ipcMessage方法
                    ipcMessageHandler(args).then(modifiedArgs => {
                        return target.apply(thisArg, modifiedArgs)
                    }).catch(err => {
                        console.log(err);
                        target.apply(thisArg, args)
                    })
                }
            })
            pluginLog('ipc监听器修改成功')

            //这里添加一个快捷键
            globalShortcut.register('Control+E', () => {
                if (window.isFocused()) {
                    pluginLog('快捷键触发,更改EC状态')
                    window.webContents.send('LiteLoader.encrypt_chat.ECactivator');
                } else pluginLog('窗口未聚焦，不更改')
            })

        } catch (e) {
            console.log(e)
        }
    }
}

async function onload() {
    ipcMain.handle("LiteLoader.encrypt_chat.messageEncryptor", (_, message) => messageEncrypter(message))
    ipcMain.handle("LiteLoader.encrypt_chat.messageDecryptor", (_, message) => messageDecrypter(message))
    ipcMain.handle("LiteLoader.encrypt_chat.decodeHex", (_, message) => decodeHex(message))
    ipcMain.handle("LiteLoader.encrypt_chat.getWindowID", (event) => event.sender.getOwnerBrowserWindow().id)
    ipcMain.handle("LiteLoader.encrypt_chat.imgDecryptor", (_, imgPath) => imgDecryptor(imgPath))
    ipcMain.handle("LiteLoader.encrypt_chat.imgChecker", (_, imgPath) => imgChecker(imgPath))
    //设置相关，给renderer进程用
    ipcMain.handle("LiteLoader.encrypt_chat.getConfig", () => Config.getConfig())
    ipcMain.handle("LiteLoader.encrypt_chat.setConfig", (event, newConfig) => Config.setConfig(newConfig))

    await Config.initConfig(pluginPath, configPath)
}

// const ipcInvokeProxy = window.webContents._events["-ipc-invoke"]
// const proxyIpcInvoke = new Proxy(ipcInvokeProxy, {
//     apply(target, thisArg, args) {
//         pluginLog('proxyIpcInvoke收到的消息如下')
//         console.log(args)
//         return target.apply(thisArg, args)
//     }
// })
// window.webContents._events["-ipc-invoke"] = proxyIpcInvoke
//
// const ipcMsgSyncProxy = window.webContents._events['-ipc-message-sync']
// const proxyIpcMsgSync = new Proxy(ipcMsgSyncProxy, {
//     apply(target, thisArg, args) {
//         pluginLog('proxyIpcMsgSync收到的消息如下')
//         console.log(args)
//         return target.apply(thisArg, args)
//     }
// })
// window.webContents._events['-ipc-message-sync'] = proxyIpcMsgSync
//
// const ipcPortsProxy = window.webContents._events['-ipc-ports']
// const proxyIpcPorts = new Proxy(ipcPortsProxy, {
//     apply(target, thisArg, args) {
//         pluginLog('ipcPortsProxy收到的消息如下')
//         console.log(args)
//         return target.apply(thisArg, args)
//     }
// })
// window.webContents._events['-ipc-ports'] = proxyIpcPorts
//
// const ipcAddNewContentsProxy = window.webContents._events['-add-new-contents']
// const proxyAddNewContents = new Proxy(ipcAddNewContentsProxy, {
//     apply(target, thisArg, args) {
//         pluginLog('proxyAddNewContents收到的消息如下')
//         console.log(args)
//         return target.apply(thisArg, args)
//     }
// })
// window.webContents._events['-add-new-contents'] = proxyAddNewContents
//
// const ipcBeforeUnloadFiredProxy = window.webContents._events['-before-unload-fired']
// const proxyBeUnFired = new Proxy(ipcBeforeUnloadFiredProxy, {
//     apply(target, thisArg, args) {
//         pluginLog('ipcBeforeUnloadFiredProxy收到的消息如下')
//         console.log(args)
//         return target.apply(thisArg, args)
//     }
// })
// window.webContents._events['-add-new-contents'] = proxyBeUnFired