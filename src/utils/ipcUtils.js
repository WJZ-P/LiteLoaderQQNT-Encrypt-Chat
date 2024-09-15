const {Config} = require("../Config.js")
const {imgEncryptor} = require("./imageUtils.js");
const {pluginLog} = require("./logUtils");
const config = Config.config
const fs = require('fs')
const {messageEncryptor} = require("./cryptoUtils.js");

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
            item.textElement.content = messageEncryptor(item.textElement.content)
        }
        //说明消息内容是图片类，md5HexStr这个属性一定要对，会做校验
        else if (item.elementType === 2) {
            const result = await imgEncryptor(item.picElement.sourcePath)
            console.log(result)

            //获取缓存路径
            const cachePath = item.picElement.sourcePath.substring(0,
                item.picElement.sourcePath.lastIndexOf('\\') + 1) + result.picMD5 + '.gif';
            //复制图片到QQ缓存的目录
            pluginLog('正在复制图片到QQ缓存目录,目录为' + cachePath)
            fs.copyFileSync(result.picPath, cachePath);
            fs.unlink(item.picElement.sourcePath, (err) => {
                if (err) console.log(err)
            })//把发送的源图片删除，避免泄露
            Object.assign(item.picElement, {
                md5HexStr: result.picMD5,
                sourcePath: cachePath,
                fileName: result.picMD5 + '.gif',
                picWidth: 1,
                picHeight: 1,
                //picType: 2000,                   //gif是2000，图片是1001，1000是表情包
                //picSubType: 0,                  //设置为0是图片类型，1是表情包类型，会影响渲染大小

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

module.exports = {ipcMessageHandler}