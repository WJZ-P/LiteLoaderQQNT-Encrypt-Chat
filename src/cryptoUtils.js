const CryptoJS = require("crypto-js");

const cryptoConfig={
    iv: CryptoJS.lib.WordArray.random(16),
    mode: CryptoJS.mode.CBC, // 设置模式为CBC
    padding: CryptoJS.pad.Pkcs7 // 设置填充方式为PKCS#7
}

let encrypedText=CryptoJS.AES.encrypt("Hello, world!", "secret key 123").toString();

console.log(encrypedText);

//解密
let originalText=CryptoJS.AES.decrypt(encrypedText, "secret key 123").toString(CryptoJS.enc.Utf8);

console.log(originalText);
console.log(CryptoJS.lib.WordArray.random(16).toString());