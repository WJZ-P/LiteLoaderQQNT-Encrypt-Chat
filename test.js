const {decodeHex, messageEncrypter}=require('./src/cryptoUtils')
let msg ='嘻嘻喵'
if(''===decodeHex(msg)) console.log(123)
else console.log(1)

console.log(messageEncrypter('哇嘎嘎！'))