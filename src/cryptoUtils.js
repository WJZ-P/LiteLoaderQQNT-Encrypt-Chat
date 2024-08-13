const CryptoJS = require("crypto-js");

const cryptoConfig = {
    iv: CryptoJS.lib.WordArray.random(16),
    mode: CryptoJS.mode.CBC, // 设置模式为CBC
    padding: CryptoJS.pad.Pkcs7 // 设置填充方式为PKCS#7
}

const styles = {
    Bangboo: {
        length: [1, 5],
        content: ['嗯呢', '，', '嗯', '！', '...', '嗯呢哒', '嗯呐呐']
    }
}

let nowStyles=styles.Bangboo
//消息加密器
export function messageEncrypter(message) {

}

const divider = '⁣'



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
    '+': '︀', '/': '︁', '=': '︂'
};


let encrypedText = CryptoJS.AES.encrypt("Hello, world!", "secret key 123").toString();

console.log(encrypedText);

//解密
let originalText = CryptoJS.AES.decrypt(encrypedText, "secret key 123").toString(CryptoJS.enc.Utf8);

console.log(originalText);
console.log(CryptoJS.lib.WordArray.random(16).toString());
console.log(divider)

