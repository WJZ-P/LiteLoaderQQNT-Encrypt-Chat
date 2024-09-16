const {createCipheriv, createDecipheriv, randomBytes,createHash} = require("crypto");
function hashSha256(data) {
    const hash = createHash('sha256');
// 更新哈希对象与输入数据
    hash.update(data, 'utf-8');
// 计算哈希值并以十六进制（hex）字符串形式输出
    return hash.digest();
}



function hashMd5(data) {
    const hash = createHash('md5');
// 更新哈希对象与输入数据
    hash.update(data, 'utf-8');
// 计算哈希值并以十六进制（hex）字符串形式输出
    return hash.digest();
}

/**
 * 加密函数
 * @param data {string|Buffer}
 * @param key {Buffer} Hex格式的密钥
 * @returns {Buffer}
 */
function encrypt(data, key) {
    // 生成随机的初始化向量（IV）
    const iv = randomBytes(16)

    // 创建加密器
    const cipher = createCipheriv('aes-256-gcm', key, iv);

    const encrypted = Buffer.concat([
        cipher.update(data),
        cipher.final(),
        cipher.getAuthTag() // AuthTag is appended at the end of the ciphertext
    ]);

    return Buffer.concat([iv, encrypted]); // IV is prepended to the ciphertext
}

// AES-GCM 解密
function decrypt(encryptedData, key) {
    const iv = encryptedData.slice(0, 16);
    const authTag = encryptedData.slice(encryptedData.length - 16);
    const ciphertext = encryptedData.slice(16, encryptedData.length - 16);

    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
    ]);
}

module.exports={encrypt,decrypt,hashSha256,hashMd5}


// const encrypted = encrypt(Buffer.from('123哈哈哈牛逼'))
// const decrypted = decrypt(Buffer.from('795e113d39dcf89020b192a4b79feefdb13090ae0239cebe5137d67128122c9b54f1f8fd9aba9ecfd4f74e927e49e31944ab', 'hex'))
// console.log('加密数据: ', encrypted.toString('hex'))
// console.log('解密数据: ', decrypted.toString())