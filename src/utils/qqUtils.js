const {ipcRenderer} = require("electron");
let {webContentsId} = ipcRenderer.sendSync('___!boot');
if (!webContentsId) {
    webContentsId = 2;
}

/**
 * 返回图片的MD5值
 * @param imgPath 图片路径
 * @returns {Promise<*>}
 */
async function getImgMD5(imgPath) {
    return await invokeNative('ns-FsApi', 'getFileMd5', false, imgPath)
}

/**
 * 根据MD5返回该文件在QQ中的缓存存放地址。注意返回的地址是用来存放图片的，实际上这个地址还没有图片
 * @param md5HexStr
 * @returns {Promise<*>}
 */
async function getCachePath(md5HexStr) {
    return await invokeNative('ns-ntApi', 'nodeIKernelMsgService/getRichMediaFilePathForGuild', false, {
        path_info: {
            md5HexStr: md5HexStr,
            fileName: md5HexStr,
            elementType: 2,
            elementSubType: 0,
            thumbSize: 0,
            needCreate: true,
            downloadType: 1,
            file_uuid: ''
        }
    })
}

/**
 * 把图片进行复制
 * @param fromPath 要复制的图片
 * @param toPath   图片复制的地址
 * @returns {Promise<*>}
 */
async function copyImg(fromPath,toPath){
    return await invokeNative('ns-FsApi', 'copyFile', false, {
            fromPath: fromPath,
            toPath: toPath
    })
}

/**
 * 调用一个qq底层函数，并返回函数返回值。截取自https://github.com/xtaw/LiteLoaderQQNT-Euphony
 *
 * @param { String } eventName 函数事件名。
 * @param { String } cmdName 函数名。
 * @param { Boolean } registered 函数是否为一个注册事件函数。
 * @param  { ...any } args 函数参数。
 * @returns { Promise<any> } 函数返回值。
 */
function invokeNative(eventName, cmdName, registered, ...args) {
    return new Promise(resolve => {
        const callbackId = crypto.randomUUID();
        const callback = (event, ...args) => {
            if (args?.[0]?.callbackId == callbackId) {
                ipcRenderer.off(`IPC_DOWN_${webContentsId}`, callback);
                resolve(args[1]);
            }
        };
        ipcRenderer.on(`IPC_DOWN_${webContentsId}`, callback);
        ipcRenderer.send(`IPC_UP_${webContentsId}`, {
            type: 'request',
            callbackId,
            eventName: `${eventName}-${webContentsId}${registered ? '-register' : ''}`
        }, [cmdName, ...args]);
    });
}

module.exports={getCachePath,getImgMD5,copyImg}