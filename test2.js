const { createHash } = require('crypto');

function hashMd5(data) {
    const hash = createHash('md5');

    // 更新哈希对象与输入数据
    hash.update(data, 'utf-8');

    // 计算哈希值并以十六进制（hex）字符串形式输出
    return hash.digest(); // 指定返回格式为 hex
}

// 示例
const md5Hash = hashMd5('Hello, World!');
console.log(md5Hash); // 输出 MD5 哈希值的十六进制字符串