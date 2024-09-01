const {messageEncrypter, messageDecrypter, decodeHex} = require("./cryptoUtils");
let encryptedMessage=messageEncrypter('这是我的一条超级神奇的消息！')
console.log(encryptedMessage)
console.log('解密结果：'+messageDecrypter(decodeHex(encryptedMessage)))