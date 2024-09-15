const axios = require("axios");
const FormData = require('form-data');
const {encryptImg} = require("./cryptoUtils.js");
const fs = require('fs')
const config = require("../Config.js").Config.config;
const sizeOf = require('image-size');
const path = require('path')
const {decryptImg} = require("./cryptoUtils.js");
const {pluginLog} = require("./logUtils");
const {hashMd5} = require("./aesUtils");
const uploadUrl = 'https://chatbot.weixin.qq.com/weixinh5/webapp/pfnYYEumBeFN7Yb3TAxwrabYVOa4R9/cos/upload'
let singlePixelBuffer = undefined
//初始化像素缓存
const taskID = setInterval(() => {
    if (!config.tempImgPath) return
    singlePixelBuffer = fs.readFileSync(config.tempImgPath)
    pluginLog('缓存图片加载成功！内容如下')
    console.log(singlePixelBuffer)
    clearInterval(taskID)
}, 200)

/**
 * 图片加密，把图片加密到1x1的gif里面。返回对象
 * @param imgPath
 * @returns {Promise<{picPath: string, picMD5: string}>}
 */
async function imgEncryptor(imgPath) {
    try {
        const bufferImg = fs.readFileSync(imgPath);//需要被加密的图片文件
        // console.log('bufferimg')
        // console.log(bufferImg)
        //加密图片，返回加密后的buffer
        const encryptedBuffer = encryptImg(bufferImg);
        // console.log('encryptedBuffer')
        // console.log(encryptedBuffer)
        const tempImg = fs.readFileSync(config.tempImgPath)//一共35个字节
        // console.log('tempImg')
        // console.log(tempImg)
        const resultImage = Buffer.concat([tempImg, encryptedBuffer])
        // console.log('resultImage')
        // console.log(resultImage)
        fs.writeFileSync(path.join(config.pluginPath, 'src/assests/encrypted.gif'), resultImage);

        return {
            picPath: path.join(config.pluginPath, 'src/assests/encrypted.gif'),
            picMD5: hashMd5(resultImage).toString('hex')
        }
    } catch (e) {
        console.log(e)
    }
}


/**
 * 图片解密，把加密后的图片解密，保存到本地。
 * @param imgPath
 * @returns {Object|false}
 */
async function imgDecryptor(imgPath) {
    try {
        // pluginLog('下面输出加密图片的buffer')
        // console.log(fs.readFileSync(imgPath))
        const bufferImg = fs.readFileSync(imgPath).slice(35);//需要解密的图片文件,前35个是固定值，表示1x1白色gif
        // pluginLog('用来解密的图片buffer为')
        // console.log(bufferImg)

        const decryptedBufImg = decryptImg(bufferImg);
        if (!decryptedBufImg) return false//解密失败就不需要继续了

        const imgMD5 = hashMd5(decryptedBufImg).toString('hex')
        const decryptedImgPath = path.join(config.pluginPath, `src/assests/decryptedImgs/${imgMD5}.png`)
        fs.writeFileSync(decryptedImgPath, decryptedBufImg);
        const dimensions = sizeOf(decryptedBufImg)
        return {decryptedImgPath: decryptedImgPath,
            width:dimensions.width,
            height:dimensions.height,
            type:dimensions.type,
        }
    } catch (e) {
        pluginLog(e)
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

/**
 * 检查图片是否为加密过的图像
 * @param imgPath
 * @returns {Promise<boolean>}
 */
async function imgChecker(imgPath) {
    try {
        const bufferImg = fs.readFileSync(imgPath).slice(0, 35);
        console.log(bufferImg)
        return bufferImg.equals(singlePixelBuffer)
    } catch (e) {
        return false
    }
}

module.exports = {uploadImage, imgEncryptor, imgDecryptor, imgChecker}