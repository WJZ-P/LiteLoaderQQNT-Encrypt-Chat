const {messageEncrypter} = require("./cryptoUtils");
const {Config}=require("../Config.js")

const config=Config.config
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

module.exports = {ipcMessage}