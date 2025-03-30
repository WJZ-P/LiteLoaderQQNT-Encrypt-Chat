const {ipcMain, shell} = require("electron");
const fs = require("fs")
const {messageDecryptor, messageEncryptor, decodeHex} = require("./utils/cryptoUtils");
const path = require("path");
const {ipcModifyer} = require("./utils/ipcUtils");
const {pluginLog} = require("./utils/logUtils")
const {Config} = require("./Config.js")
const {imgDecryptor, imgChecker} = require("./utils/imageUtils");
const {deleteFiles, ecFileHandler} = require("./utils/fileUtils");

const pluginPath = path.join(LiteLoader.plugins.encrypt_chat.path.plugin);//插件目录
const configPath = path.join(pluginPath, "config.json");

const config = Config.config

const chatWindows = []//单独聊天窗口和QQ主界面的聊天窗口

// 运行在 Electron 主进程 下的插件入口

onload()//妈的，启动！

// 创建窗口时触发
module.exports.onBrowserWindowCreated = async window => {
    //必须在窗口加载完成后再进行处理，否则getURL()为空
    window.webContents.on("did-stop-loading", async () => {
        if (window.webContents.getURL().indexOf("#/main/message") != -1 ||
            window.webContents.getURL().indexOf("#/chat") != -1 //确认是聊天窗口
        ) {
            chatWindows.push(window);
            pluginLog('当前窗口ID为' + window.id)
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

        //是聊天窗口才修改
        try {
            //window 为 Electron 的 BrowserWindow 实例
            if (window.ecIsLoaded) return pluginLog("[Main]已修改IPC，不需要重复加载")
            window.ecIsLoaded = true

            pluginLog('启动！')
            //替换掉官方的ipc监听器
            window.webContents._events["-ipc-message"] = ipcModifyer(window.webContents._events["-ipc-message"], window)
            //这里修改关闭窗口时候的函数，用来在关闭QQ时清空加密图片缓存
            window.webContents._events['-before-unload-fired'] = new Proxy(window.webContents._events['-before-unload-fired'], {
                apply(target, thisArg, args) {
                    try {
                        //下面删除掉加密图片缓存
                        const cachePath = path.join(config.pluginPath, 'decryptedImgs')
                        deleteFiles(cachePath)
                    } catch (e) {
                        console.log(e)
                    }
                    return target.apply(thisArg, args)
                }
            })

            pluginLog('ipc监听器修改成功')

        } catch (e) {
            pluginLog(e)
        }
    })
}

async function onload() {
    ipcMain.handle("LiteLoader.encrypt_chat.messageEncryptor", (_, message) => messageEncryptor(message))
    ipcMain.handle("LiteLoader.encrypt_chat.messageDecryptor", (_, message, uin) => messageDecryptor(message, uin))
    ipcMain.handle("LiteLoader.encrypt_chat.decodeHex", (_, message) => decodeHex(message))
    ipcMain.handle("LiteLoader.encrypt_chat.getWindowID", (event) => event.sender.getOwnerBrowserWindow().id)
    ipcMain.handle("LiteLoader.encrypt_chat.imgDecryptor", (_, imgPath, peerUid) => imgDecryptor(imgPath, peerUid))
    ipcMain.handle("LiteLoader.encrypt_chat.imgChecker", (_, imgPath) => imgChecker(imgPath))
    //进行下载文件的解密与保存。
    ipcMain.on("LiteLoader.encrypt_chat.ecFileHandler", (_, fileBuffer, fileName, peerUid) => ecFileHandler(fileBuffer, fileName, peerUid))
    //打开对应目录的文件夹
    ipcMain.on("LiteLoader.encrypt_chat.openPath", (_, filePath) => shell.openPath(filePath))

    ipcMain.on("LiteLoader.encrypt_chat.showMainProcessInfo", (_, message) => {
        const globalObject = global

        // 将变量名按点分割
        const keys = message.split('.');
        if (keys.length === 0) return console.log(globalObject)

        // 遍历获取深层属性
        let currentValue = globalObject;
        for (const key of keys) {
            if (currentValue && currentValue.hasOwnProperty(key)) {
                currentValue = currentValue[key];
            } else {
                console.log(`${message} is not defined in the global scope.`);
                return;
            }
        }

        // 打印最终的值
        console.log(`${message}:\n`, currentValue);
    })

    //检查对应文件是否存在
    ipcMain.handle("LiteLoader.encrypt_chat.isFileExist", (_, filePathArray) => fs.existsSync(path.join(...filePathArray)))

    //设置相关，给renderer进程用
    ipcMain.handle("LiteLoader.encrypt_chat.getConfig", () => Config.getConfig())
    //设置config，同时检查是否更改主题色，改了就发送rePatchCss请求。
    ipcMain.handle("LiteLoader.encrypt_chat.setConfig", async (event, newConfig) => {
        pluginLog('主进程收到setConfig消息，更新设置。')
        const oldMainColor = config.mainColor//先保存下当前的主题色
        const newestConfig = await Config.setConfig(newConfig)//更新配置，并且返回新的配置
        if (newestConfig?.mainColor !== oldMainColor) //说明改变了主题色
            sendMsgToChatWindows("LiteLoader.encrypt_chat.rePatchCss");//主进程给渲染进程发送重新渲染ECcss消息
        else pluginLog("主题色未改变，不需要rePatchCss")
        return newestConfig
    })

    ipcMain.handle("LiteLoader.encrypt_chat.getMenuHTML", () => fs.readFileSync(path.join(config.pluginPath, 'src/pluginMenu.html'), 'utf-8'))
    ipcMain.on("LiteLoader.encrypt_chat.sendMsgToChatWindows", (_, message, args) => {
        console.log('主进程准备处理sendMsgToChatWindows')
        pluginLog(_, message, args)
        sendMsgToChatWindows(message, args)
    })

    await Config.initConfig(pluginPath, configPath)
}

/**
 * 主进程发消息通知所有渲染进程中的聊天窗口
 * @param message
 * @param args
 */
function sendMsgToChatWindows(message, args) {
    pluginLog('给渲染进程发送重新渲染ECcss消息')
    // pluginLog('所有聊天窗口如下')
    // console.log(chatWindows)
    pluginLog(args)
    for (const window of chatWindows) {
        if (window.isDestroyed()) continue;
        window.webContents.send(message, args);
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