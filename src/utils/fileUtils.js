const fs = require('fs');
const path = require("path")
const {pluginLog} = require("./logUtils");
const {decryptImg} = require("./cryptoUtils");
//const singlePixelPngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')
const config = require("../Config.js").Config.config;

/**
 * 清空给定路径下的所有文件
 * @param filePath
 */
function deleteFiles(filePath) {
    console.log('deleteFiles触发辣')
    fs.readdir(filePath, (err, files) => {
        if (err) {
            console.error(`无法读取目录: ${err}`);
            return;
        }

        files.forEach(file => {

            console.log('准备删除文件')
            const imgPath = path.join(filePath, file);
            console.log('当前文件路径为' + imgPath)
            fs.unlink(imgPath, err => {
                if (err) {
                    console.error(`无法删除图片！: ${imgPath}, 错误: ${err}`);
                } else {
                    console.log(`成功删除图片: ${imgPath}`);
                }
            });
        });
    });
}

/**
 * 获取文件buffer
 * @param filePath
 * @returns {Promise<Buffer>}
 */
function getFileBuffer(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) reject(err)
            else resolve(data)
        })
    })
}

function ecFileHandler(filearrayBuffer, fileName, peerUid) {
    const fileBuffer = Buffer.from(filearrayBuffer, 'binary')
    pluginLog('获取到的文件buffer为')
    console.log(fileBuffer)
    const decryptedBufFile = decryptImg(fileBuffer.slice(68), peerUid)//可以用同样的办法解密文件，因为都是二进制
    if (!decryptedBufFile) {
        pluginLog('文件解密失败！')
        return false
    }//解密失败就不需要继续了
    fs.writeFile(config.downloadFilePath + `\\${fileName}`, decryptedBufFile, (err) => {
        if (err) pluginLog(err)
    })

}


module.exports = {deleteFiles, getFileBuffer, ecFileHandler}