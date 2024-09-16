const {Config} = require("../Config.js")
const {pluginLog} = require("./logUtils");
const {encrypt, decrypt, hashSha256} = require("./aesUtils.js");
const replaceMap = {}
const config = Config.config

for (let i = 0xfe00; i <= 0xfe0f; i++) {//型号选择器1-16
    const hex = (i - 0xfe00).toString(16)
    replaceMap[hex] = String.fromCodePoint(i)//根据Unicode码替换成对应的字符
}

const styles = {
    Bangboo: {
        length: [2, 5],
        content: ['嗯呢...', '哇哒！', '嗯呢！', '嗯呢哒！', '嗯呐呐！', '嗯哒！', '嗯呢呢！']
    }
}

//初始化一些函数的值
let nowStyles = styles.Bangboo


/**
 * 写成函数是因为需要判断值是否为空，为空则返回默认值
 * @returns {Buffer}
 */
function getKey() {
    return hashSha256(config.encryptionKey.trim() || "20040821")
}

/**
 * 消息加密器
 * @param {string} messageToBeEncrypted
 * @returns {string}
 */
function messageEncryptor(messageToBeEncrypted) {
    //随机生成密语
    let minLength = nowStyles.length[0];
    let maxLength = nowStyles.length[1];
    let content = nowStyles.content;
    let randomLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let randomMsg = ''
    //拼接随机字符
    for (let i = 0; i < randomLength; i++) {
        const randomIndex = Math.floor(Math.random() * content.length)
        randomMsg += content[randomIndex]
    }

    //加密明文
    const encryptedMessage = encrypt(Buffer.from(messageToBeEncrypted), getKey()).toString('hex')
    // console.log('[EC] 加密后的密文' + encryptedMessage)
    //密文转成空白符
    return encodeHex(encryptedMessage) + randomMsg//加密后的密文
}

/**
 *消息解密器,解密失败会返回空字符串
 * @param {string} hexStr 里面有一个十六进制格式的字符串
 * @returns {string|null}
 */
function messageDecryptor(hexStr) {
    try {
        // console.log('[EC] 解密器启动，message为' + hexStr)
        const bufferMsg = Buffer.from(hexStr, 'hex')

        const decryptedText = decrypt(bufferMsg, getKey()).toString('utf-8')

        // 检查是否解密成功
        if (!decryptedText) {
            console.error('解密失败，返回的结果为空或无效 UTF-8 数据');
            return null; // 或其他处理
        }

        return decryptedText;
    } catch (e) {
        // console.log(e)
        return ""
    }
}

function encodeHex(result) {
    for (const key in replaceMap) {
        result = result.replaceAll(key, replaceMap[key])
    }
    return result
}

function decodeHex(content) {
    // console.log('decodeHex启动，content为' + content)
    content = [...content].filter((it) => Object.values(replaceMap).includes(it)).join("").trim()
    for (const key in replaceMap) {
        content = content.replaceAll(replaceMap[key], key)
    }
    return content
}

/**
 * 图像加密器。不进行空字符转换。直接返回加密后的密文
 * @param bufferImg
 * @returns {Buffer}
 */
function encryptImg(bufferImg) {
    // JPG 文件以字节 0xFF 0xD8 开头
    // PNG 文件以字节 0x89 0x50 0x4E 0x47 开头
    // GIF 文件以字节 0x47 0x49 0x46 开头

    // pluginLog('即将进行加密的图片为')
    // console.log(bufferImg)
    //加密明文
    const encryptedImg = encrypt(bufferImg, getKey())
    // pluginLog('[EC] 加密后的图片为')
    // console.log(encryptedImg)
    return encryptedImg
}

/**
 * 图像解密器，输入和输出都是buffer
 * @param bufferImg 需要解密的imgBuffer
 * @returns {Buffer|false}    解密完成的图片Buffer
 */
function decryptImg(bufferImg) {
    try {
        const decryptedBufImg = decrypt(bufferImg, getKey())
        // pluginLog('图片解密的结果为')
        // console.log(decryptedBufImg)
        return decryptedBufImg
    } catch (e) {
        return false
    }
}

module.exports = {messageEncryptor, messageDecrypter: messageDecryptor, decodeHex, encryptImg, decryptImg}