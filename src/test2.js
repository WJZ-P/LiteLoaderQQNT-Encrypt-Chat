const {messageEncrypter, messageDecrypter, decodeHex} = require("./cryptoUtils");
let encryptedMessage=messageEncrypter('我是超级稻草人')
console.log(encryptedMessage)
console.log('解密结果：'+messageDecrypter(decodeHex(encryptedMessage)))