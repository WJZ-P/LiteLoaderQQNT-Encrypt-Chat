const fs = require('fs');
const crypto = require('crypto');

// AES 加密函数
function encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted; // 将 IV 和密文组合
}

// 嵌入数据到图片
function embedData(imageBuffer, data) {
    const dataBuffer = Buffer.from(data);
    const combinedBuffer = Buffer.concat([imageBuffer, dataBuffer]);
    return combinedBuffer;
}

// 读取图片并处理
async function processImages(originalImagePath, targetImagePath, key) {
    // 读取原始图片
    const originalImage = fs.readFileSync(originalImagePath);

    // 将图片转换为 16 进制字符串
    const hexString = originalImage.toString('hex');

    // 加密字符串
    const encryptedData = encrypt(hexString, key);

    // 读取目标图片
    const targetImage = fs.readFileSync(targetImagePath);

    // 嵌入加密后的字符串
    const resultImage = embedData(targetImage, encryptedData);

    // 保存新的图片
    fs.writeFileSync('output_image.png', resultImage);
}

// 使用示例
const originalImagePath = 'path/to/original/image.png';
const targetImagePath = 'path/to/target/image.png';
const key = crypto.randomBytes(32); // 生成一个随机密钥

processImages(originalImagePath, targetImagePath, key)
    .then(() => console.log('处理完成'))
    .catch(err => console.error('发生错误:', err));
