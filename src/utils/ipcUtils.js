const {messageEncrypter} = require("./cryptoUtils.js");
const {Config} = require("../Config.js")
const {uploadImage, pictureEncrypt} = require("./imageUtils");

const config = Config.config

/**
 * 处理QQ消息,对符合条件的msgElement的content进行加密再返回
 * @param args
 * @returns {Promise<*>}
 */
async function ipcMessageHandler(args) {
    //判断是否是nodeIKernelMsgService/sendMsg事件
    // if(args[3][1][1]) console.log(args[3][1][1])

    if (!args?.[3]?.[1]?.[0] || args[3][1][0] !== 'nodeIKernelMsgService/sendMsg') return args;

    console.log('下面打印出nodeIKernelMsgService/sendMsg的内容')
    console.log(args[3][1][1])
    console.log('下面打印出具体的msgElement')
    for (let item of args[3][1][1].msgElements) {
        console.log(item)
    }

    //console.log(args[3][1][1].msgElements?.[0].textElement)

    //下面判断加密是否启用，启用了就修改消息内容
    if (!config.activeEC) return

    //————————————————————————————————————————————————————————————————————
    //修改原始消息
    for (let item of args[3][1][1].msgElements) {
        //说明消息内容是文字类
        if (item.elementType === 1) {

            //艾特别人的不需要解密
            if (item.textElement?.atUid !== '') {
                continue;//艾特消息无法修改content，NTQQ似乎有别的措施防止。
            }
            //修改解密消息
            item.textElement.content = messageEncrypter(item.textElement.content)
        }
        //说明消息内容是图片类，md5HexStr这个属性一定要对，会做校验
        else if (item.elementType === 2) {
            const result = await pictureEncrypt(item.picElement.sourcePath)
            // const result = {
            //     picPath: 'E:\\LiteloaderQQNT\\plugins\\Encrypt-Chat\\src\\assests\\encrypted.gif',
            //     picMD5: 'ea58ae68db65df3a77653a6690e4ef20'
            // }
            console.log(result)
            Object.assign(item.picElement, {
                md5HexStr: result.picMD5,
                sourcePath: result.picPath,
                fileName: 'encrypted.gif',
                picType: 2000,                   //gif是2000，图片是1001
                picSubType: 0,                  //设置为图片类型，1是表情包类型，不一样
                picWidth: 1,
                picHeight: 1,
            })
        }
    }
    console.log('修改后的,msgElements为')
    for (let item of args[3][1][1].msgElements) {
        console.log(item)
    }

    return args
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports = {ipcMessage: ipcMessageHandler}