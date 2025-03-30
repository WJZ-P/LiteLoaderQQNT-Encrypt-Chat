// Electron 主进程 与 渲染进程 交互的桥梁
const {contextBridge, ipcRenderer} = require("electron");

// 在window对象下导出只读对象
contextBridge.exposeInMainWorld("encrypt_chat", {
    messageEncryptor: (message) => ipcRenderer.invoke("LiteLoader.encrypt_chat.messageEncryptor", message),
    messageDecryptor: (message, peerUid) => ipcRenderer.invoke("LiteLoader.encrypt_chat.messageDecryptor", message, peerUid),
    imgDecryptor: (imgPath, peerUid) => ipcRenderer.invoke("LiteLoader.encrypt_chat.imgDecryptor", imgPath, peerUid),
    imgChecker: (imgPath) => ipcRenderer.invoke("LiteLoader.encrypt_chat.imgChecker", imgPath),
    decodeHex: (message) => ipcRenderer.invoke("LiteLoader.encrypt_chat.decodeHex", message),
    getWindowID: () => ipcRenderer.invoke("LiteLoader.encrypt_chat.getWindowID"),
    getMenuHTML: () => ipcRenderer.invoke("LiteLoader.encrypt_chat.getMenuHTML"),
    ecFileHandler: (fileBuffer, fileName, peerUid) => ipcRenderer.send("LiteLoader.encrypt_chat.ecFileHandler", fileBuffer, fileName, peerUid),
    openPath: (filePath) => ipcRenderer.send("LiteLoader.encrypt_chat.openPath", filePath),
    isFileExist: (filePathArray) => ipcRenderer.invoke("LiteLoader.encrypt_chat.isFileExist", filePathArray),
    //设置相关，给renderer进程用
    getConfig: () => ipcRenderer.invoke("LiteLoader.encrypt_chat.getConfig"),
    setConfig: (newConfig) => ipcRenderer.invoke("LiteLoader.encrypt_chat.setConfig", newConfig),
    addEventListener: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    isChatWindow: () => ipcRenderer.invoke("LiteLoader.encrypt_chat.isChatWindow"),
    sendIPC: (channel, arg) => ipcRenderer.send(channel, arg),//渲染进程用来发送IPC消息,其实不需要，NTQQ的window对象有ipcRenderer
    showMainProcessInfo: (message) => ipcRenderer.send("LiteLoader.encrypt_chat.showMainProcessInfo", message),
    //发送消息到所有聊天窗口
    sendMsgToChatWindows: (message, arg) => {
        //console.log(message,arg)
        ipcRenderer.send("LiteLoader.encrypt_chat.sendMsgToChatWindows", message, arg)
    },

    invokeNative: (eventName, cmdName, registered, webContentId, ...args) => invokeNative(eventName, cmdName, registered, webContentId, ...args)
});


/**
 * 调用一个qq底层函数，并返回函数返回值。来自
 * https://github.com/xtaw/LiteLoaderQQNT-Euphony/blob/master/src/main/preload.js
 *
 * @param { String } eventName 函数事件名。
 * @param { String } cmdName 函数名。
 * @param { Boolean } registered 函数是否为一个注册事件函数。
 * @param {Number} webContentId 当前窗口的webContentsId，在window对象中有这个属性。
 * @param  { ...Object } args 函数参数。
 * @returns { Promise<any> } 函数返回值。
 */
function invokeNative(eventName, cmdName, registered, webContentId, ...args) {
    console.log(`尝试发送IPC消息，webContentsId${webContentId},eventName${eventName},cmdName${cmdName},registered${registered},args${args}`)
    return new Promise(resolve => {
        const callbackId = crypto.randomUUID();
        const callback = (event, ...args) => {
            if (args?.[0]?.callbackId == callbackId) {
                ipcRenderer.off(`IPC_DOWN_${webContentId}`, callback);
                resolve(args[1]);
            }
        };
        ipcRenderer.on(`IPC_DOWN_${webContentId}`, callback);
        ipcRenderer.send(`IPC_UP_${webContentId}`, {
            type: 'request',
            callbackId,
            eventName: `${eventName}-${webContentId}${registered ? '-register' : ''}`
        }, [cmdName, ...args]);
    });
}


// contextBridge.exposeInMainWorld('euphonyNative', {
//     subscribeEvent,
//     unsubscribeEvent
// })

// /**
//  * 为qq底层事件 `cmdName` 添加 `handler` 处理器。
//  *
//  * @param { String } cmdName 事件名称。
//  * @param { Function } handler 事件处理器。
//  * @returns { Function } 新的处理器。
//  */
// function subscribeEvent(cmdName, handler) {
//     const listener = (event, ...args) => {
//         if (args?.[1]?.[0]?.cmdName == cmdName) {
//             handler(args[1][0].payload);
//         }
//     };
//     ipcRenderer.on(`IPC_DOWN_${webContentsId}`, listener);
//     return listener;
// }
//
//
// /**
//  * 移除qq底层事件的 `handler` 处理器。
//  *
//  * 请注意，`handler` 并不是传入 `subscribeEvent` 的处理器，而是其返回的新处理器。
//  *
//  * @param { Function } handler 事件处理器。
//  */
// function unsubscribeEvent(handler) {
//     ipcRenderer.off(`IPC_DOWN_${webContentsId}`, handler);
// }