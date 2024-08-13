const CryptoJS = require("crypto-js");

let encrypedText=CryptoJS.AES.encrypt("Hello, world!", "secret key 123").toString();

console.log(encrypedText);

//解密
let originalText=CryptoJS.AES.decrypt(encrypedText, "secret key 123").toString(CryptoJS.enc.Utf8);

console.log(originalText);