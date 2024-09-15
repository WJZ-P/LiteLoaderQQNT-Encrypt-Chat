const {createCipheriv, createDecipheriv, randomBytes} = require("crypto");
const crypto = require("crypto")

function hashMd5(data) {
    const hash = crypto.createHash('md5');

// 更新哈希对象与输入数据
    hash.update(data, 'utf-8');

// 计算哈希值并以十六进制（hex）字符串形式输出
    return hash.digest();
}


function encrypt(data, key) {
    // 生成随机的初始化向量（IV）
    const iv = randomBytes(16)

    // 创建加密器
    const cipher = createCipheriv('aes-128-gcm', key, iv);

    const encrypted = Buffer.concat([
        cipher.update(data),
        cipher.final(),
        cipher.getAuthTag() // AuthTag is appended at the end of the ciphertext
    ]);

    return Buffer.concat([iv, encrypted]); // IV is prepended to the ciphertext
}

// AES-GCM 解密
function decrypt(encrypted, key = hashMd5('123')) {
    const iv = encrypted.slice(0, 16);
    const authTag = encrypted.slice(encrypted.length - 16);
    const ciphertext = encrypted.slice(16, encrypted.length - 16);

    const decipher = createDecipheriv('aes-128-gcm', key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
    ]);
}

const encrypted = encrypt(Buffer.from('123哈哈哈牛逼'))
const decrypted = decrypt(Buffer.from('795e113d39dcf89020b192a4b79feefdb13090ae0239cebe5137d67128122c9b54f1f8fd9aba9ecfd4f74e927e49e31944ab', 'hex'))
console.log('加密数据: ', encrypted.toString('hex'))
console.log('解密数据: ', decrypted.toString())