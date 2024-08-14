const {decodeHex}=require('./src/cryptoUtils')
let msg ='嘻嘻喵'
if(''===decodeHex(msg)) console.log(123)
else console.log(1)

console.log(typeof (decodeHex(msg)))