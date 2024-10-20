const fs = require('fs');
const {pluginLog} = require("./utils/logUtils")
const path = require('path');

class Config {
    static config = {
        tempImgPath: "",
        pluginPath: "",
        configPath: "",
        mainColor: '#66ccff',                   //主颜色
        activeEC: false,                        //是否启用加密功能
        encryptionKey: '',                      //加密密钥
        downloadFilePath: '',                   //解密文件的下载路径
        isUseTag: true,                         //是否使用tag，即解密消息下方的"原消息"
        styles: {
            Bangboo: {//邦布语
                length: [2, 5],
                content: ['嗯呢...', '哇哒！', '嗯呢！', '嗯呢哒！', '嗯呐呐！', '嗯哒！', '嗯呢呢！']
            },
            Hilichurl: {//丘丘语
                length: [2, 5],
                content: ['Muhe ye!', 'Ye dada!', 'Ya yika!', 'Biat ye！', 'Dala si？', 'Yaya ika！', 'Mi? Dada!', 'ye pupu!', 'gusha dada!']
            },
            Nier: {//Nier: AutoMata，尼尔语, is that the price I'm paying for my past mistakes?
                length: [5, 8],
                content: [
                    "Ee ", "ser ", "les ", "hii ", "san ", "mia ", "ni ", "Escalei ", "lu ", "push ", "to ", "lei ",
                    "Schmosh ", "juna ", "wu ", "ria ", "e ", "je ", "cho ", "no ",
                    "Nasico ", "whosh ", "pier ", "wa ", "nei ", "Wananba ", "he ", "na ", "qua ", "lei ",
                    "Sila ", "schmer ", "ya ", "pi ", "pa ", "lu ", "Un ", "schen ", "ta ", "tii ", "pia ", "pa ", "ke ", "lo "
                ]
            },
            Neko: {//猫娘语
                length: [3, 5],
                content: ["嗷呜!", "咕噜~", "喵~", "喵咕~", "喵喵~", "喵?", "喵喵！", "哈！", "喵呜...", "咪咪喵！", "咕咪?"]
            },
            Doggo: { // 小狗语
                length: [2, 5],
                content: ["汪汪！", "汪呜~", "嗷呜~", "呜汪？", "汪汪呜！", "汪呜呜~", "嗷嗷！"]
            },

            Birdie: { // 小鸟语
                length: [2, 5],
                content: ["啾啾~", "咕咕！", "叽叽~", "啾啾啾！", "叽咕？", "啾啾？", "咕啾~"]
            },

        },
        currentStyleName: 'Neko',     //默认使用喵喵语
        independentKeyList: [          //独立key数组
            {note: '', id: '', key: ''},
        ]

    }

    static async initConfig(pluginPath, configPath) {
        this.config.pluginPath = pluginPath
        this.config.configPath = configPath
        this.config.tempImgPath = path.join(pluginPath, 'src/assests/1x1#FFFFFF.gif')
        this.config.downloadFilePath = path.join(pluginPath, 'decryptedFiles')
        pluginLog('现在执行initConfig方法')
        if (!(fs.existsSync(this.config.configPath))) {//如果文件目录不存在，就创建文件
            pluginLog('第一次启动，准备创建配置文件')
            pluginLog('插件路径为' + this.config.pluginPath)
            fs.writeFileSync(this.config.configPath, JSON.stringify(this.config, null, 4), 'utf-8')
            pluginLog('配置文件创建成功')
        }
        Object.assign(this.config, JSON.parse(fs.readFileSync(this.config.configPath, 'utf-8')))
        pluginLog('当前的配置文件为')
        console.log(this.config)
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
        try {
            // 使用 Object.assign() 更新 config 对象的属性
            Object.assign(this.config, newConfig);
            // 写入配置文件
            fs.writeFile(this.config.configPath, JSON.stringify(this.config, null, 4), 'utf-8', (err) => {
                if (err) {
                    pluginLog('修改配置文件失败')
                }
            })
            pluginLog('修改配置文件成功')
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = {Config}