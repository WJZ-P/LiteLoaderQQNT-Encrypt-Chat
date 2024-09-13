const axios = require("axios");
const FormData = require('form-data');
const {imgEncryptor} = require("./cryptoUtils.js");
const fs = require('fs')
const config = require("../Config.js").Config.config;
const CryptoJS = require("crypto-js");
const path = require('path')
const uploadUrl = 'https://chatbot.weixin.qq.com/weixinh5/webapp/pfnYYEumBeFN7Yb3TAxwrabYVOa4R9/cos/upload'

/**
 * 图片加密，把图片加密到1x1的gif里面。返回对象
 * @param imgPath
 * @returns {Promise<{picPath: string, picMD5: string}>}
 */
async function pictureEncrypt(imgPath) {
    try {
        const bufferImg = fs.readFileSync(imgPath);//需要被加密的图片文件
        // console.log('bufferimg')
        // console.log(bufferImg)
        //加密图片，返回加密后的buffer
        const encryptedBuffer = imgEncryptor(bufferImg);
        // console.log('encryptedBuffer')
        // console.log(encryptedBuffer)
        const tempImg = fs.readFileSync(config.tempImgPath)//一共35个字节
        // console.log('tempImg')
        // console.log(tempImg)
        const resultImage = Buffer.concat([tempImg, Buffer.from(encryptedBuffer)])
        // console.log('resultImage')
        // console.log(resultImage)
        fs.writeFileSync(path.join(config.pluginPath, 'src/assests/encrypted.gif'), resultImage);

        return {
            picPath: path.join(config.pluginPath, 'src/assests/encrypted.gif'),
            picMD5: CryptoJS.MD5(CryptoJS.lib.WordArray.create(resultImage)).toString(CryptoJS.enc.Hex)
        }
    } catch (e) {
        console.log(e)
    }
}

async function uploadImage(imgPath) {
    try {
        const formData = new FormData();
        const imgStream = fs.createReadStream(imgPath);
        formData.append('media', imgStream);
        //发送请求
        const response = await axios.post(uploadUrl, formData)
        return response.data
    } catch (e) {
        console.error(e)
    }
}

module.exports = {uploadImage, pictureEncrypt}