const fs = require('fs');
const fsAsync = require('fs').promises;
const {pluginLog} = require("./utils/logUtils")


class Config {
    static pluginPath = ""
    static configPath = ""
    static config = {
        mainColor: '#66ccff',                   //主颜色
        activeEC: false,                        //是否启用加密功能
        encryptionKey: ''                       //加密密钥
    }

    static async initConfig(pluginPath,configPath) {
        this.pluginPath = pluginPath
        this.configPath = configPath
        pluginLog('现在执行initConfig方法')
        if (!(fs.existsSync(this.configPath))) {//如果文件目录不存在，就创建文件
            pluginLog('第一次启动，准备创建配置文件')
            pluginLog('插件路径为' + this.pluginPath)
            fs.writeFileSync(this.configPath, JSON.stringify(this.config), 'utf-8')
            pluginLog('配置文件创建成功')
        }
        Object.assign(this.config, await this.getConfig())
        pluginLog('当前的配置文件为')
        pluginLog(this.config)
        pluginLog('配置初始化完毕')
    }

    static async getConfig() {
        try {
            return this.config
        } catch (e) {
            pluginLog('读取配置文件失败')
        }
    }

    static async setConfig(newConfig) {
        // 使用 Object.assign() 更新 config 对象的属性
        Object.assign(this.config, newConfig);
        // 写入配置文件
        fs.writeFile(this.configPath, JSON.stringify(newConfig), 'utf-8', (err) => {
            if (err) {
                pluginLog('修改配置文件失败')
            }
        })
        pluginLog('修改配置文件成功')
    }
}

module.exports={Config}