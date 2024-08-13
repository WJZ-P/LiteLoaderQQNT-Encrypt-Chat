const CryptoJS = require("crypto-js");

const cryptoConfig = {
    iv: CryptoJS.lib.WordArray.random(16),
    mode: CryptoJS.mode.CBC, // 设置模式为CBC
    padding: CryptoJS.pad.Pkcs7 // 设置填充方式为PKCS#7
}

const styles = {
    Bangboo: {
        length: [1, 5],
        content: ['嗯呢', '，', '嗯', '！', '...', '嗯呢哒', '嗯呐呐', '嗯哒!', '嗯呢呢!']
    }
}

let nowStyles = styles.Bangboo
let secretKey = '20040821'
const divider = '⁣'

//消息加密器
function messageEncrypter(originalMessage) {
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
    let encryptedMessage = CryptoJS.AES.encrypt(originalMessage, secretKey, cryptoConfig).toString();
    //明文转成空白符
    encryptedMessage = encryptedMessage.split('').map(char => customMappingTable[char] || char).join('');
    return result + divider + encryptedMessage
}

/**
 *消息解密器
 * @param {string} message
 */
function messageDecoder(message) {
    //拿到密文
    let encrypedMessage = message.split(divider)[1]
    encrypedMessage = encrypedMessage.split('').map(char => reversedMappingTable[char] || char).join('');
    console.log('[messageDecoder]'+encrypedMessage)
    //返回明文
    return CryptoJS.AES.decrypt(encrypedMessage, secretKey).toString(CryptoJS.enc.Utf8)
}


const customMappingTable = {
    '0': '︀', '1': '︁', '2': '︂', '3': '︃', '4': '︄',
    '5': '︅', '6': '︆', '7': '︇', '8': '︈', '9': '︉',
    'a': '󠁡', 'b': '󠁢', 'c': '󠁣', 'd': '󠁤', 'e': '󠁥',
    'f': '󠁦', 'g': '󠁧', 'h': '󠁨', 'i': '󠁩', 'j': '󠁪',
    'k': '󠁫', 'l': '󠁬', 'm': '󠁭', 'n': '󠁮', 'o': '󠁯',
    'p': '󠁰', 'q': '󠁱', 'r': '󠁲', 's': '󠁳', 't': '󠁴',
    'u': '󠁵', 'v': '󠁶', 'w': '󠁷', 'x': '󠁸', 'y': '󠁹',
    'z': '󠁺',
    'A': '󠁁', 'B': '󠁂', 'C': '󠁃', 'D': '󠁄', 'E': '󠁅',
    'F': '󠁆', 'G': '󠁇', 'H': '󠁈', 'I': '󠁉', 'J': '󠁊',
    'K': '󠁋', 'L': '󠁌', 'M': '󠁍', 'N': '󠁎', 'O': '󠁏',
    'P': '󠁐', 'Q': '󠁑', 'R': '󠁒', 'S': '󠁓', 'T': '󠁔',
    'U': '󠁕', 'V': '󠁖', 'W': '󠁗', 'X': '󠁘', 'Y': '󠁙',
    'Z': '󠁚',
    '+': '󠄀', '/': '󠄁', '=': '󠄂'
};
const reversedMappingTable = {
    '︀': '0', '︁': '1', '︂': '2', '︃': '3', '︄': '4',
    '︅': '5', '︆': '6', '︇': '7', '︈': '8', '︉': '9',
    '󠁡': 'a', '󠁢': 'b', '󠁣': 'c', '󠁤': 'd', '󠁥': 'e',
    '󠁦': 'f', '󠁧': 'g', '󠁨': 'h', '󠁩': 'i', '󠁪': 'j',
    '󠁫': 'k', '󠁬': 'l', '󠁭': 'm', '󠁮': 'n', '󠁯': 'o',
    '󠁰': 'p', '󠁱': 'q', '󠁲': 'r', '󠁳': 's', '󠁴': 't',
    '󠁵': 'u', '󠁶': 'v', '󠁷': 'w', '󠁸': 'x', '󠁹': 'y',
    '󠁺': 'z',
    '󠁁': 'A', '󠁂': 'B', '󠁃': 'C', '󠁄': 'D', '󠁅': 'E',
    '󠁆': 'F', '󠁇': 'G', '󠁈': 'H', '󠁉': 'I', '󠁊': 'J',
    '󠁋': 'K', '󠁌': 'L', '󠁍': 'M', '󠁎': 'N', '󠁏': 'O',
    '󠁐': 'P', '󠁑': 'Q', '󠁒': 'R', '󠁓': 'S', '󠁔': 'T',
    '󠁕': 'U', '󠁖': 'V', '󠁗': 'W', '󠁘': 'X', '󠁙': 'Y',
    '󠁚': 'Z',
    '󠄀': '+', '󠄁': '/', '󠄂': '='
}

let encryptedText='a'.split('').map(char => customMappingTable[char] || char).join('')
console.log(encryptedText)
console.log(encryptedText.split('').map(char => reversedMappingTable[char] || char).join(''))
module.exports = {messageEncrypter, messageDecoder};
