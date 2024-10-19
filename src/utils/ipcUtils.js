const {Config} = require("../Config.js")
const {imgEncryptor} = require("./imageUtils.js");
const {pluginLog} = require("./logUtils");
const config = Config.config
const fs = require('fs')
const {messageEncryptor} = require("./cryptoUtils.js");
const {imgChecker, imgDecryptor, uploadImage, singlePixelPngBuffer} = require("./imageUtils");
const {getFileBuffer} = require("./fileUtils");
const {encryptImg} = require("./cryptoUtils");


/**
 * 修改消息ipc
 * @param ipcProxy
 * @param window    window对象，主要用于在上传文件时提供进度条回馈。
 * @returns {function}
 */
function ipcModifyer(ipcProxy, window) {
    return new Proxy(ipcProxy, {
        async apply(target, thisArg, args) {
            let modifiedArgs = args;
            try {//thisArg是WebContent对象
                //设置ipc通道名
                const ipcName = args?.[3]?.[1]?.[0]
                const eventName = args?.[3]?.[0]?.eventName
                //测试
                //if(ipcName==='nodeIKernelMsgService/ForwardMsgWithComment') console.log(JSON.stringify(args))
                //if(eventName!=="ns-LoggerApi-2") console.log(JSON.stringify(args))//调试的时候用

                if (ipcName === 'nodeIKernelMsgService/sendMsg') modifiedArgs = await ipcMsgModify(args, window);
                if (ipcName === 'openMediaViewer') modifiedArgs = ipcOpenImgModify(args);

                return target.apply(thisArg, modifiedArgs)
            } catch (err) {
                console.log(err);
                target.apply(thisArg, args)
            }
        }
    })
}

/**
 * 处理QQ消息,对符合条件的msgElement的content进行加密再返回
 * @param args
 * @param window    用来上传文件时向渲染进程发消息，显示进度条
 * @returns {args}
 */
async function ipcMsgModify(args, window) {
    if (!args?.[3]?.[1]?.[0] || args[3][1][0] !== 'nodeIKernelMsgService/sendMsg') return args;

    console.log('下面打印出nodeIKernelMsgService/sendMsg的内容')
    console.log(JSON.stringify(args[3][1][1],null,2))
    //console.log(args[3][1][1].msgElements?.[0].textElement)

    //下面判断加密是否启用，启用了就修改消息内容
    if (!config.activeEC) return args

    //————————————————————————————————————————————————————————————————————
    //修改原始消息
    const peerUid=args[3][1][1].peer?.peerUid
    for (let item of args[3][1][1].msgElements) {

        //说明消息内容是文字类
        if (item.elementType === 1) {

            //艾特别人的不需要解密
            if (item.textElement?.atUid !== '' || item.textElement?.atType === 1) {
                continue;//艾特消息无法修改content，NTQQ似乎有别的措施防止。
            }
            //修改解密消息
            pluginLog("准备进行加密！")
            item.textElement.content = messageEncryptor(item.textElement.content,peerUid)
        }



        //说明消息内容是图片类，md5HexStr这个属性一定要对，会做校验
        else if (item.elementType === 2) {
            if (imgChecker(item.picElement.sourcePath)) return//要发送的是加密图片，不进行二次加密

            const result = imgEncryptor(item.picElement.sourcePath)
            console.log(result)

            //获取缓存路径
            const cachePath = item.picElement.sourcePath.substring(0,
                item.picElement.sourcePath.lastIndexOf('\\') + 1) + result.picMD5 + '.gif';
            //复制图片到QQ缓存的目录
            pluginLog('正在复制图片到QQ缓存目录,目录为' + cachePath)
            fs.copyFileSync(result.picPath, cachePath);
            fs.unlink(item.picElement.sourcePath, (err) => {
                if (err) console.log(err)
            })//把发送的源图片删除，避免泄露
            Object.assign(item.picElement, {
                md5HexStr: result.picMD5,
                sourcePath: cachePath,
                fileName: result.picMD5 + '.gif',
                picWidth: 1,
                picHeight: 1,
                //fileSize: '520',                  //没效果
                // thumbPath:cachePath,             //这么写会报错
                //picType: 2000,                   //gif是2000，图片是1001，1000是表情包
                //picSubType: 0,                  //设置为0是图片类型，1是表情包类型，会影响渲染大小

            })
        }


        //下面处理加密文件
        else if (item.elementType === 3)//3是发送文件
        {
            const fileName = item.fileElement.fileName
            const filePath = item.fileElement.filePath
            const fileSize = item.fileElement.fileSize
            //获取文件的buffer后对buffer进行加密
            pluginLog('获取到文件buffer，加密中')
            const encryptedFileBuffer = encryptImg((await getFileBuffer(filePath)))//和图片加密的方法是一样的，都是二进制


            //把文件buffer插入1x1的png里面后发送文件请求
            pluginLog('发送上传请求中')
            let result = undefined
            try {
                result = await uploadImage(Buffer.concat([singlePixelPngBuffer, encryptedFileBuffer]), (progress) => {
                    try {
                        window.webContents.send('LiteLoader.encrypt_chat.uploadProgress', progress)
                        pluginLog('发送进度条消息中,当前进度' + progress)
                    } catch (e) {
                        console.log(e)
                    }
                })
                pluginLog('上传成功')
            } catch (e) {
                pluginLog('上传失败')
                pluginLog(e)
            }

            pluginLog(JSON.stringify(result))
            if (result) {
                const fileObj = {
                    type: 'ec-encrypted-file',
                    fileName: fileName,
                    fileUrl: result.url,
                    fileSize: fileSize,
                    encryptionKey: config.encryptionKey  //直接放上加密文件的key
                }

                //把加密文件插入到消息元素中
                textElement.textElement.content = messageEncryptor(JSON.stringify(fileObj),peerUid)

            } else textElement.textElement.content = messageEncryptor('[EC]文件发送失败，可能是文件过大',peerUid)

            args[3][1][1].msgElements = [textElement]
        }
    }

    // console.log('修改后的,msgElements为')
    // for (let item of args[3][1][1].msgElements) {
    //     console.log(item)
    // }
    return args
}


/**
 * 处理打开图片的ipc消息，如果打开的是密文图片，那么切换成自己的解密后的图片。
 * @param args
 * @returns {args}
 */
function ipcOpenImgModify(args) {
    const mediaList = args[3][1][1].mediaList
    const imgPath = decodeURIComponent(mediaList[0].originPath).substring(9)//获取原始路径
    if (!imgChecker(imgPath)) {
        console.log('[EC]图片校验未通过！渲染原图')
        return args
    }
    //下面开始解密图片
    const decryptedObj = imgDecryptor(imgPath)
    if (!decryptedObj) return args; //解密失败直接返回
    console.log(decryptedObj)
    //decryptedImgPath: 'E:\\LiteloaderQQNT\\plugins\\Encrypt-Chat\\decryptedImgs\\54dcd5689b10debf8a718d30f6b0691a.png',
    mediaList[0].originPath = "appimg://" + encodeURI(decryptedObj.decryptedImgPath.replace("\\", "/"))
    mediaList[0].size = {width: decryptedObj.width, height: decryptedObj.height}
    pluginLog('修改后的图片路径：' + mediaList[0].originPath)
    return args
}

const textElement = {
    elementType: 1,
    elementId: '',
    textElement: {content: '测试', atType: 0, atUid: '', atTinyId: '', atNtUid: ''}
}


module.exports = {ipcModifyer}
//插入一个卡片消息
// args[3][1][1].msgElements.push({
//     elementType: 10,
//     elementId: '',
//     arkElement: {
//         bytesData: JSON.stringify({
//             "app": "com.tencent.tdoc.qqpush",
//             "desc": "",
//             "bizsrc": "",
//             "view": "pic",
//             "ver": "1.0.0.15",
//             "prompt": "[QQ红包]恭喜发财",
//             "meta": {
//                 "pic": {
//                     "jumpUrl": "",
//                     "preview": "http:\/\/p.qlogo.cn\/homework\/0\/hw_h_4xknus6xi70gkck66c88b25f1298\/0\/25632286"
//                 }
//             },
//             "config": {"ctime": 1714214660, "forward": 1, "token": "f1245530d59bccad2b1c695544e98efb"}
//         }),
//         linkInfo: null,
//         subElementType: null
//     }
// })