const {ipcMain, globalShortcut} = require("electron");
const fs = require("fs")
const {messageDecrypter, messageEncrypter, decodeHex} = require("./utils/cryptoUtils");
const path = require("path");
const {ipcMessageHandler} = require("./utils/ipcUtils");
const {pluginLog} = require("./utils/logUtils")
const {Config} = require("./Config.js")
const {imgDecryptor, imgChecker} = require("./utils/imageUtils");
const {deleteFiles} = require("./utils/fsUtils");

const pluginPath = path.join(LiteLoader.plugins.encrypt_chat.path.plugin);//插件目录
const configPath = path.join(pluginPath, "config.json");

const config = Config.config

const chatWindows = []//单独聊天窗口和QQ主界面的聊天窗口

// 运行在 Electron 主进程 下的插件入口

// 创建窗口时触发
module.exports.onBrowserWindowCreated = async window => {
    //必须在窗口加载完成后再进行处理，否则getURL()为空
    window.webContents.on("did-stop-loading", async () => {
        if (window.webContents.getURL().indexOf("#/main/message") != -1 ||
            window.webContents.getURL().indexOf("#/chat") != -1
        ) {
            chatWindows.push(window);
        }

        // pluginLog('当前窗口的title如下：')
        // console.dir(window, { showHidden: true });   //打印出窗口的所有信息
        // pluginLog(window.title)                      //恒为QQ
        // pluginLog(window.accessibleTitle)            //空的
        // pluginLog(window.representedFilename)        //空的
        // pluginLog('当前窗口的contentView如下：')
        // console.log(window.contentView)                 //一个空对象{}

        // pluginLog('当前窗口的webContents如下：')
        // console.log(window.webContents)

        //是主窗口才修改
        if (window.id === 2) {
            try {
                //window 为 Electron 的 BrowserWindow 实例
                pluginLog('启动！')
                await onload()
                pluginLog("main.js onLoad注入成功")

                //获取官方的消息监听器
                const ipcMessageProxy = window.webContents._events["-ipc-message"]

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


                //这里修改关闭窗口时候的函数，用来在关闭QQ时清空加密图片缓存
                const ipcUnloadProxy = window.webContents._events['-before-unload-fired']
                window.webContents._events['-before-unload-fired'] = new Proxy(ipcUnloadProxy, {
                    apply(target, thisArg, args) {
                        try {
                            //下面删除掉加密图片缓存
                            console.log('unload事件触发辣')
                            const cachePath = path.join(config.pluginPath, 'decryptedImgs')
                            deleteFiles(cachePath)
                        } catch (e) {
                            console.log(e)
                        }
                        return target.apply(thisArg, args)
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
    })
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

    ipcMain.handle("LiteLoader.encrypt_chat.setConfig", (event, newConfig) => {
        pluginLog('主进程收到setConfig消息，更新设置。')
        const oldMainColor = config.mainColor//先保存下当前的主题色
        const newestConfig = Config.setConfig(newConfig)//更新配置，并且返回新的配置

        if (newConfig?.mainColor !== oldMainColor) //说明改变了主题色
            sendMsgToChatWindows("LiteLoader.encrypt_chat.rePatchCss");//主进程给渲染进程发送重新渲染ECcss消息
        return newestConfig
    })

    ipcMain.handle("LiteLoader.encrypt_chat.getMenuHTML", () => fs.readFileSync(path.join(config.pluginPath, 'src/pluginMenu.html'), 'utf-8'))
    ipcMain.handle("LiteLoader.encrypt_chat.isChatWindow", (event) => (event.sender.getOwnerBrowserWindow().webContents.getURL().indexOf("#/main/message") != -1
        || event.sender.getOwnerBrowserWindow().webContents.getURL().indexOf("#/chat") != -1))

    await Config.initConfig(pluginPath, configPath)
}

/**
 * 主进程发消息通知所有渲染进程中的聊天窗口
 * @param message
 */
function sendMsgToChatWindows(message) {
    pluginLog('给渲染进程发送重新渲染ECcss消息')
    pluginLog('所有聊天窗口如下')
    console.log(chatWindows)
    for (const window of chatWindows) {
        if (window.isDestroyed()) continue;
        window.webContents.send(message);
    }
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