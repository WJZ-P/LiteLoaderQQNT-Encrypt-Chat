const fs = require('fs');
const axios = require("axios");
const FormData = require('form-data');

const uploadUrl = 'https://chatbot.weixin.qq.com/weixinh5/webapp/pfnYYEumBeFN7Yb3TAxwrabYVOa4R9/cos/upload'

async function uploadImage(imgPath) {
    try {
        const formData = new FormData();
        const imgStream=fs.createReadStream(imgPath);
        formData.append('media', imgStream);
        //发送请求
        const response = await axios.post(uploadUrl, formData)
        return response.data
    } catch (e) {
        console.error(e)
    }
}

module.exports = {uploadImage}