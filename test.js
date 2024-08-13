const QRCode = require('qrcode')
const fs = require('fs')

const filePath ="F:/QQ文件/1369727119/nt_qq/nt_data/Pic/2024-08/Ori/d2f99a24505928b5c1b78ff5230745ba.png"

// 读取二维码图片文件
fs.readFile(filePath, (err, data) => {
    if (err) throw err;
    try{
        const result=QRCode.decode(data)
        console.log(result)
    }catch (e){
        console.log("无法解析二维码"+e)}
})