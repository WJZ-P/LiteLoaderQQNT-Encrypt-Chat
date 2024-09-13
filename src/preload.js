// Electron 主进程 与 渲染进程 交互的桥梁
const {contextBridge, ipcRenderer} = require("electron");
// 在window对象下导出只读对象
contextBridge.exposeInMainWorld("encrypt_chat", {
    messageEncrypter: (message) => ipcRenderer.invoke("LiteLoader.encrypt_chat.messageEncrypter", message),
    messageDecrypter: (message) => ipcRenderer.invoke("LiteLoader.encrypt_chat.messageDecrypter", message),
    decodeHex: (message) => ipcRenderer.invoke("LiteLoader.encrypt_chat.decodeHex", message),
    getWindowID: () => ipcRenderer.invoke("LiteLoader.encrypt_chat.getWindowID"),
    //设置相关，给renderer进程用
    getConfig: () => ipcRenderer.invoke("LiteLoader.encrypt_chat.getConfig"),
    setConfig: (newConfig) => ipcRenderer.invoke("LiteLoader.encrypt_chat.setConfig", newConfig),
});