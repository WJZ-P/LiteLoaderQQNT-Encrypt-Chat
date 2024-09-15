const CryptoJS = require("crypto-js");
const {Config} = require("../Config.js")
const {pluginLog} = require("./logUtils");
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
 * @returns {*}
 */
function getKey() {
    return CryptoJS.MD5(config.encryptionKey.trim() || "20040821")
}

/**
 * 消息加密器
 * @param {string} messageToBeEncrypted
 * @returns {string}
 */
function messageEncryptor(messageToBeEncrypted) {
    let minLength = nowStyles.length[0];
    let maxLength = nowStyles.length[1];
    let content = nowStyles.content;
    let randomLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let result = ''
    //拼接随机字符
    for (let i = 0; i < randomLength; i++) {
        const randomIndex = Math.floor(Math.random() * content.length)
        result += content[randomIndex]
    }
    //加密明文
    const iv = CryptoJS.lib.WordArray.random(16)
    let encryptedMessage = CryptoJS.AES.encrypt(messageToBeEncrypted, getKey(), {
        iv: iv,
        mode: CryptoJS.mode.CBC, // 设置模式为CBC
        padding: CryptoJS.pad.Pkcs7 // 设置填充方式为PKCS#7
    }).ciphertext.toString(CryptoJS.enc.Hex);
    //console.log('[EC] 加密后的密文' + encryptedMessage)
    //密文转成空白符
    return encodeHex(iv.toString(CryptoJS.enc.Hex) + encryptedMessage) + result//加密后的密文
}

/**
 *消息解密器,解密失败会返回空字符串
 * @param {string} message 里面有一个十六进制格式的字符串
 * @returns {string}
 */
function messageDecryptor(message) {
    try {
        console.log('[EC] 解密器启动，message为' + message)

        //获得密文中的iv，为密文的前32位
        const iv = CryptoJS.enc.Hex.parse(message.slice(0, 32))

        // 创建 CipherParams 对象
        const ciphertext = CryptoJS.enc.Hex.parse(message.substring(32));
        // 进行解密
        const decrypted = CryptoJS.AES.decrypt({ciphertext: ciphertext}, getKey(), {
            iv: iv,
            mode: CryptoJS.mode.CBC, // 设置模式为CBC
            padding: CryptoJS.pad.Pkcs7 // 设置填充方式为PKCS#7
        });

        // 尝试将解密的数据转换为 UTF-8 字符串
        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

        // 检查是否解密成功
        if (!decryptedText) {
            console.error('解密失败，返回的结果为空或无效 UTF-8 数据');
            return null; // 或其他处理
        }

        return decryptedText;
    } catch (e) {
        console.log(e)
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
    pluginLog('即将进行加密的图片为')
    console.log(bufferImg)
    //加密明文
    const iv = CryptoJS.lib.WordArray.random(16)
    const encryptedImg = CryptoJS.AES.encrypt(CryptoJS.lib.WordArray.create(bufferImg), getKey(), {
        iv: iv,
        mode: CryptoJS.mode.CBC, // 设置模式为CBC
        padding: CryptoJS.pad.Pkcs7 // 设置填充方式为PKCS#7
    }).ciphertext.toString(CryptoJS.enc.Hex);

    pluginLog('[EC] 加密后的图片为')
    console.log(Buffer.from(encryptedImg))
    pluginLog('此次图片加密的iv为')
    console.log(iv.toString(CryptoJS.enc.Hex))
    return Buffer.concat([Buffer.from(iv.toString(CryptoJS.enc.Hex), 'hex'),
        Buffer.from(encryptedImg)])//加密后的buffer格式的图片,前面为iv
}

/**
 * 图像解密器，输入和输出都是buffer
 * @param bufferImg 需要解密的imgBuffer
 * @returns {Buffer}    解密完成的图片Base64
 */
function decryptImg(bufferImg) {
    try {
        //获得密文中的iv，为密文的前32/2=16位，因为格式是buffer，buffer每个字节是两个16进制数
        const iv = CryptoJS.lib.WordArray.create(CryptoJS.lib.WordArray.create(bufferImg).words.slice(0, 4))
        //const iv = CryptoJS.lib.WordArray.random(16)
        pluginLog('decryptImg获得的iv为')
        console.log(iv.toString(CryptoJS.enc.Hex))
        bufferImg = bufferImg.slice(16)//修改bufferImg
        pluginLog('即将进行解密的图片为')
        console.log(Buffer.from(bufferImg))//到这里为止都没问题

        const decryptedBufImg = Buffer.from(CryptoJS.AES.decrypt(bufferImg.toString('base64'), getKey(), {
            iv: iv,
            mode: CryptoJS.mode.CBC, // 设置模式为CBC
            padding: CryptoJS.pad.Pkcs7 // 设置填充方式为PKCS#7
        }).toString(CryptoJS.enc.Hex), 'hex')//先转16进制，再转Buffer
        pluginLog('图片解密的结果为')
        console.log(decryptedBufImg)
        return decryptedBufImg
    } catch (e) {
        console.log(e)
    }
}

module.exports = {messageEncryptor, messageDecrypter: messageDecryptor, decodeHex, encryptImg, decryptImg}