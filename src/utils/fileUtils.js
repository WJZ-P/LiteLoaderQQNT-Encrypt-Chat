const fs = require('fs');
const path = require("path")

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


module.exports = {deleteFiles,getFileBuffer}