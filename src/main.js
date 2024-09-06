const {ipcMain} = require("electron");
const {messageDecrypter, messageEncrypter, decodeHex} = require("./cryptoUtils");
const path = require("path");
const fs = require('fs');

const pluginPath = path.join(LiteLoader.path.plugins, "Encrypt-Chat");
const configPath = path.join(pluginPath, "config.json");
const pluginName = hexToAnsi('#66ccff') + "[Encrypt-Chat] " + '\x1b[0m'
const config = {
    activeEC: false
}

// 运行在 Electron 主进程 下的插件入口

// 创建窗口时触发
module.exports.onBrowserWindowCreated = async window => {
    // window 为 Electron 的 BrowserWindow 实例
    if (window.id !== 2) return//2是QQ主页面，此时才加载插件，id属性为number

    console.log(pluginName + '启动！')
    await onload()
    console.log(pluginName + "main.js onLoad注入成功")


    // console.log('当前窗口ID为'+window.getOwnerBrowserWindow().id)
    // console.log('下面打印的是window.webContents._events')
    // console.log(window.webContents._events)//是一个匿名函数
    //获取官方的消息监听器
    const ipcMessageProxy = window.webContents._events["-ipc-message"]
    //创建一个自己的代理
    const proxyIpcMsg = new Proxy(ipcMessageProxy, {
        apply(target, thisArg, args) {
            ipcMessage(args).then(result => {
                return target.apply(thisArg, result)
            }).catch(err => {
                console.log('err', err)
                target.apply(thisArg, args)
            })
        }
    })

    //替换掉官方的监听器
    window.webContents._events["-ipc-message"] = proxyIpcMsg
}

async function onload() {
    ipcMain.on("LiteLoader.encrypt_chat.setActiveEC", (_, activeState) => {
        config.activeEC = activeState
    })
    ipcMain.handle("LiteLoader.encrypt_chat.messageEncrypter", (_, message) => messageEncrypter(message))
    ipcMain.handle("LiteLoader.encrypt_chat.messageDecrypter", (_, message) => messageDecrypter(message))
    ipcMain.handle("LiteLoader.encrypt_chat.decodeHex", (_, message) => decodeHex(message))
    ipcMain.handle("LiteLoader.encrypt_chat.getActiveEC", () => config.activeEC)
    ipcMain.handle("LiteLoader.encrypt_chat.getWindowID", (event) => event.sender.getOwnerBrowserWindow().id)

    console.log(pluginName + '设置配置中')
    await initConfig()
}

/**
 * 处理QQ消息,对符合条件的msgElement的content进行加密再返回
 * @param args
 * @returns {Promise<*>}
 */
async function ipcMessage(args) {
    //判断是否是nodeIKernelMsgService/sendMsg事件
    // if(args[3][1][1]) console.log(args[3][1][1])

    if (!args?.[3]?.[1]?.[0] || args[3][1][0] !== 'nodeIKernelMsgService/sendMsg') return args;

    console.log('下面打印出nodeIKernelMsgService/sendMsg的内容')
    console.log(args[3][1][1])
    console.log('下面打印出具体的textElement')
    for (let item of args[3][1][1].msgElements) {
        console.log(item)
    }

    //console.log(args[3][1][1].msgElements?.[0].textElement)

    //下面判断加密是否启用，启用了就修改消息内容
    if (!config.activeEC) return

    //修改原始消息
    for (let item of args[3][1][1].msgElements) {
        //连续艾特两个人，会多出一个空白content的msgElement夹在两次艾特中间。
        //每艾特一次别人，会用一个msgElement存储。内容为@xxx。

        //艾特别人的不需要解密
        if (item.textElement.atUid !== '') {
            continue;//艾特消息无法修改content，NTQQ似乎有别的措施防止。
        }
        item.textElement.content = messageEncrypter(item.textElement.content)
    }
    console.log('修改后的,msgElements为')
    for (let item of args[3][1][1].msgElements) {
        console.log(item)
    }

    return args

}


async function initConfig() {
    console.log('现在执行initConfig方法')
    if (!(fs.existsSync(configPath))) {//如果文件目录不存在，就创建文件
        console.log(pluginName + '第一次启动，准备创建配置文件')
        console.log(pluginName + '插件路径为' + pluginPath)
        fs.writeFileSync(configPath, JSON.stringify(config), 'utf-8')
        console.log(pluginName + '配置文件创建成功')
    }
    console.log(await getConfig())
    console.log(pluginName+'配置初始化完毕')
}

async function getConfig() {
    let newConfig = undefined
    fs.readFile(configPath, "utf-8", (err, data) => {
        newConfig = JSON.parse(data)
        console.log(pluginName + '读取配置文件成功')
    })
    return newConfig
}

async function setConfig(newConfig) {
    fs.writeFile(configPath, JSON.stringify(newConfig), 'utf-8', (err) => {
        if (err) {
            console.log(pluginName + '写入配置文件失败')
        }
    })
    console.log(pluginName + '写入配置文件成功')
}

function hexToAnsi(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `\x1b[38;2;${r};${g};${b}m`;
}
