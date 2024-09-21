// Electron 主进程 与 渲染进程 交互的桥梁
const {contextBridge, ipcRenderer} = require("electron");

// 在window对象下导出只读对象
contextBridge.exposeInMainWorld("encrypt_chat", {
    messageEncryptor: (message) => ipcRenderer.invoke("LiteLoader.encrypt_chat.messageEncryptor", message),
    messageDecryptor: (message) => ipcRenderer.invoke("LiteLoader.encrypt_chat.messageDecryptor", message),
    imgDecryptor: (imgPath) => ipcRenderer.invoke("LiteLoader.encrypt_chat.imgDecryptor", imgPath),
    imgChecker: (imgPath) => ipcRenderer.invoke("LiteLoader.encrypt_chat.imgChecker", imgPath),
    decodeHex: (message) => ipcRenderer.invoke("LiteLoader.encrypt_chat.decodeHex", message),
    getWindowID: () => ipcRenderer.invoke("LiteLoader.encrypt_chat.getWindowID"),
    getMenuHTML: () => ipcRenderer.invoke("LiteLoader.encrypt_chat.getMenuHTML"),
    ecFileHandler: (fileBuffer, fileName) => ipcRenderer.send("LiteLoader.encrypt_chat.ecFileHandler", fileBuffer, fileName),
    openPath: (filePath) => ipcRenderer.send("LiteLoader.encrypt_chat.openPath", filePath),
    isFileExist: (filePathArray) => ipcRenderer.invoke("LiteLoader.encrypt_chat.isFileExist", filePathArray),
    //设置相关，给renderer进程用
    getConfig: () => ipcRenderer.invoke("LiteLoader.encrypt_chat.getConfig"),
    setConfig: (newConfig) => ipcRenderer.invoke("LiteLoader.encrypt_chat.setConfig", newConfig),
    addEventListener: (channel, func) => ipcRenderer.on(channel, (event, ...args) => {
        func(...args)
    }),
    isChatWindow: () => ipcRenderer.invoke("LiteLoader.encrypt_chat.isChatWindow")
});


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