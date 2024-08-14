const CryptoJS = require("crypto-js");

const cryptoConfig = {
    iv: CryptoJS.lib.WordArray.random(16),
    mode: CryptoJS.mode.CBC, // 设置模式为CBC
    padding: CryptoJS.pad.Pkcs7 // 设置填充方式为PKCS#7
}

const replaceMap = {}

for (let i = 0xfe00; i <= 0xfe0f; i++) {//型号选择器1-16
    const hex = (i - 0xfe00).toString(16)
    replaceMap[hex] = String.fromCodePoint(i)//根据Unicode码替换成对应的字符
}

const styles = {
    Bangboo: {
        length: [2, 5],
        content: ['嗯呢', '，', '嗯', '！', '...', '嗯呢哒', '嗯呐呐', '嗯哒！', '嗯呢呢！']
    }
}

let nowStyles = styles.Bangboo
let secretKey = '20040821'

/**
 * 消息加密器
 * @param {string} messageToBeEncrypted
 * @returns {string}
 */
function messageEncrypter(messageToBeEncrypted) {
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
    let encryptedMessage = CryptoJS.AES.encrypt(messageToBeEncrypted, secretKey, cryptoConfig).toString();
    console.log('[EC] 加密后的密文'+encryptedMessage)
    //密文转十六进制
    let hexMsg = Buffer.from(encryptedMessage, 'utf-8').toString('hex')
    console.log('[EC] 密文转十六进制'+hexMsg)

    //密文转成空白符
    return result + encodeHex(hexMsg)//加密后的密文
}

/**
 *消息解密器
 * @param {string} message
 * @returns {string}
 */
function messageDecoder(message) {
    //拿到密文
    const encrypedMessage=decodeHex(message)
    //密文转回UTF-8
    const utfMsg=Buffer.from(encrypedMessage, 'hex').toString('utf-8')
    console.log('[messageDecoder]' + utfMsg)
    //返回明文
    return CryptoJS.AES.decrypt(utfMsg, secretKey).toString(CryptoJS.enc.Utf8)
}


function encodeHex(result) {
    for (const key in replaceMap) {
        result = result.replaceAll(key, replaceMap[key])
    }
    return result
}

function decodeHex(content) {
    content = [...content].filter((it) => Object.values(replaceMap).includes(it)).join("").trim()
    for (const key in replaceMap) {
        content = content.replaceAll(replaceMap[key], key)
    }
    return content
}



module.exports={messageEncrypter,messageDecoder,decodeHex}