const CryptoJS = require("crypto-js");
const {Config}=require("../Config.js")
const replaceMap = {}

const config = Config.config

for (let i = 0xfe00; i <= 0xfe0f; i++) {//型号选择器1-16
    const hex = (i - 0xfe00).toString(16)
    replaceMap[hex] = String.fromCodePoint(i)//根据Unicode码替换成对应的字符
}

const styles = {
    Bangboo: {
        length: [2, 5],
        content: ['嗯呢，', '嗯！', "哇哒！", '...', '嗯呢哒', '嗯呐呐!', '嗯哒！', '嗯呢呢！']
    }
}

//初始化一些函数的值
let nowStyles = styles.Bangboo


/**
 * 写成函数是因为需要判断值是否为空，为空则返回默认值
 * @returns {*}
 */
function getKey() {
    if (config.encryptionKey.trim() === "") return CryptoJS.MD5("20040821")//为空则返回默认值
    else return CryptoJS.MD5(config.encryptionKey)
}

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
    const iv = CryptoJS.lib.WordArray.random(16)
    let encryptedMessage = CryptoJS.AES.encrypt(messageToBeEncrypted, getKey(), {
        iv: iv,
        mode: CryptoJS.mode.CBC, // 设置模式为CBC
        padding: CryptoJS.pad.Pkcs7 // 设置填充方式为PKCS#7
    }).ciphertext.toString(CryptoJS.enc.Hex);
    console.log('[EC] 加密后的密文' + encryptedMessage)
    //密文转成空白符
    return encodeHex(iv.toString(CryptoJS.enc.Hex) + encryptedMessage) + result//加密后的密文
}

/**
 *消息解密器,解密失败会返回空字符串
 * @param {string} message 里面有一个十六进制格式的字符串
 * @returns {string}
 */
function messageDecrypter(message) {
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


module.exports = {messageEncrypter, messageDecrypter, decodeHex}