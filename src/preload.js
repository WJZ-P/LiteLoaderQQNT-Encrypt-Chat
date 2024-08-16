// Electron 主进程 与 渲染进程 交互的桥梁
const {contextBridge, ipcRenderer} = require("electron");
// 在window对象下导出只读对象
contextBridge.exposeInMainWorld("encrypt_chat", {
    messageEncrypter: (message) => ipcRenderer.invoke("LiteLoader.encrypt_chat.messageEncrypter", message),
    messageDecoder: (message) => ipcRenderer.invoke("LiteLoader.encrypt_chat.messageDecoder", message),
    decodeHex: (message) => ipcRenderer.invoke("LiteLoader.encrypt_chat.decodeHex", message),
    getMenuHTML:()=> ipcRenderer.invoke("LiteLoader.encrypt_chat.getMenuHTML"),
});
