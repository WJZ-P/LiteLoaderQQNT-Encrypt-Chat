const {Config} = require("../Config.js")
const {pluginLog} = require("./logUtils");
const {encrypt, decrypt, hashSha256} = require("./aesUtils.js");
const {encoder} = require("basex-encoder")

const config = Config.config

const alphabet = new Array(16).fill(0).map((value, index) => String.fromCharCode(index + 0xfe00)).join("")
const baseZero = encoder(alphabet, 'utf-8')

const styles = config.styles

function getCurrentStyle() {
    return styles[config.currentStyleName]
}

/**
 * 写成函数是因为需要判断值是否为空，为空则返回默认值
 * @param {String} peerUid
 * @returns {Buffer}
 */
function getKey(peerUid = undefined) {
    //pluginLog('传入的peerUid为'+peerUid)
    if (!peerUid) return hashSha256(config.encryptionKey.trim() || "20040821")//没有就直接返回

    else {
        for(const keyObj of config.independentKeyList){//看看有没有能对应上的
            if(keyObj.id.trim() === peerUid.trim()){
                //找到了该单位对应的独立密钥
                //pluginLog('已找到对应密钥，为'+keyObj.key)
                return hashSha256(keyObj.key.trim())//返回对应的密钥
            }
        }
    }
    //也没找到啊，用默认密钥
    pluginLog('未找到对应密钥，使用默认密钥')
    return hashSha256(config.encryptionKey.trim() || "20040821")
}

/**
 * 消息加密器
 * @param {string} messageToBeEncrypted
 * @param {string} peerUid   目标群号，根据群号进行消息加密。
 * @returns {string}
 */
function messageEncryptor(messageToBeEncrypted,peerUid) {
    if (messageToBeEncrypted.trim() === '') return ''//空字符不加密

    //随机生成密语
    let minLength = getCurrentStyle().length[0];
    let maxLength = getCurrentStyle().length[1];
    let content = getCurrentStyle().content;
    let randomLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let randomMsg = ''
    //拼接随机字符
    for (let i = 0; i < randomLength; i++) {
        const randomIndex = Math.floor(Math.random() * content.length)
        randomMsg += content[randomIndex]
    }

    //加密明文
    const encryptedMessage = encrypt(Buffer.from(messageToBeEncrypted), getKey(peerUid)).toString('hex')
    // console.log('[EC] 加密后的密文' + encryptedMessage)
    //密文转成空白符
    return encodeHex(encryptedMessage) + randomMsg.trim()//加密后的密文
}

/**
 *消息解密器,解密失败会返回空字符串
 * @param {string} hexStr 里面有一个十六进制格式的字符串
 * @param uin
 * @returns {string|null}
 */
function messageDecryptor(hexStr, uin) {
    try {
        //pluginLog(getKey(uin).toString('hex'))
        // console.log('[EC] 解密器启动，message为' + hexStr)
        const bufferMsg = Buffer.from(hexStr, 'hex')

        const decryptedText = decrypt(bufferMsg, getKey(uin)).toString('utf-8')

        // 检查是否解密成功
        if (!decryptedText.trim()) {
            console.error('解密失败，返回的结果为空或无效 UTF-8 数据');
            return null; // 或其他处理
        }

        return decryptedText;
    } catch (e) {
         console.log(e)
        return null
    }
}

function encodeHex(result) {
    return baseZero.encode(result, 'hex')
}

function decodeHex(content) {
    // console.log('decodeHex启动，content为' + content)
    content = [...content].filter((it) => alphabet.includes(it)).join("").trim()
    return baseZero.decode(content, 'hex')
}

/**
 * 图像加密器。不进行空字符转换。直接返回加密后的密文
 * @param bufferImg
 * @returns {Buffer}
 */
function encryptImg(bufferImg,peerUid) {
    // JPG 文件以字节 0xFF 0xD8 开头
    // PNG 文件以字节 0x89 0x50 0x4E 0x47 开头
    // GIF 文件以字节 0x47 0x49 0x46 开头

    // pluginLog('即将进行加密的图片为')
    // console.log(bufferImg)
    //加密明文
    const encryptedImg = encrypt(bufferImg, getKey(peerUid))
    // pluginLog('[EC] 加密后的图片为')
    // console.log(encryptedImg)
    return encryptedImg
}

/**
 * 图像解密器，输入和输出都是buffer
 * @param bufferImg 需要解密的imgBuffer
 * @param peerUid   群号ID，字符串
 * @returns {Buffer|false}    解密完成的图片Buffer
 */
function decryptImg(bufferImg,peerUid) {
    try {
        const decryptedBufImg = decrypt(bufferImg, getKey(peerUid))
        // pluginLog('图片解密的结果为')
        // console.log(decryptedBufImg)
        return decryptedBufImg
    } catch (e) {
        return false
    }
}

module.exports = {messageEncryptor, messageDecryptor, decodeHex, encryptImg, decryptImg}