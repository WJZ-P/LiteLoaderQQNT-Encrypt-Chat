import "../assests/minJS/axios.min.js"
import {pluginLog} from "./frontLogUtils.js";

//添加css样式
const ecAPI = window.encrypt_chat
let currentConfig = await ecAPI.getConfig()
const downloadFunc = (fileObj, msgContent) => () => downloadFile(fileObj, msgContent)

export function patchCss() {
    console.log('[Encrypt-Chat]' + 'css加载中')

    let style = document.createElement('style')
    style.type = "text/css";
    style.id = "encrypt-chat-css";

    let sHtml = `.message-content__wrapper {
                    color: var(--bubble_guest_text);
                    display: flex;
                    grid-row-start: content;
                    grid-column-start: content;
                    grid-row-end: content;
                    grid-column-end: content;
                    max-width: -webkit-fill-available;
                    min-height: 38px;
                    overflow: visible !important;
                    border-radius: 10px; 
                  }
                  
            .message-encrypted-tip-left {
                position: absolute;
                top: calc(100% + 6px);
                left: 0;
                font-size: 12px;
                white-space: nowrap;
                color: var(--text-color);
                background-color: var(--background-color-05);
                backdrop-filter: blur(28px);
                padding: 4px 8px;
                margin-bottom: 2px;
                border-radius: 6px;
                box-shadow: var(--box-shadow);
                transition: 300ms;
                transform: translateX(-30%);
                opacity: 0;
                pointer-events: none;
                color:${currentConfig.mainColor};
            }
            
            .message-encrypted-tip-right {
                position: absolute;
                top: calc(100% + 6px);
                right: 0;
                font-size: 12px;
                white-space: nowrap;
                color: var(--text-color);
                background-color: var(--background-color-05);
                backdrop-filter: blur(28px);
                padding: 4px 8px;
                margin-bottom: 2px;
                border-radius: 6px;
                box-shadow: var(--box-shadow);
                transition: 300ms;
                transform: translateX(-30%);
                opacity: 0;
                pointer-events: none;
                color:${currentConfig.mainColor};
            }
            
            .message-encrypted-tip-parent {
                border-radius: 10px;
                position: relative;
                overflow: unset !important;
                margin-top:3px;
                margin-left:3px;
                margin-right:3px;
                margin-bottom: 25px;
                box-shadow: 0px 0px 8px 5px ${currentConfig.mainColor};
            }
            
.q-svg{
    position: relative;
    display: inline-block;
    transition: 0.25s;
    &:hover{
        color: #2f2f2f;
        cursor: pointer;
        scale: 1.05;
    }
}

.q-svg.active {
    fill: #66ccff; /* 更深的颜色 */
}

/*修改聊天栏背景样式，使得开启加密更加明显*/
.chat-input-area.active {
    border-top: 2px solid ${currentConfig.mainColor}; /* 添加边框 */
    transition: border-top 0.2s ease-in-out; /* 添加过渡效果 */
    box-sizing: border-box; /* 确保边框不影响布局 */
}

.q-tooltips-div{
    visibility: hidden;
    width: fit-content;
    background-color: #555;
    color: #fff;
    text-align: center;
    border-radius: 5px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    left: 50%;
    /*margin-left: -60px; !* 居中 *!*/
    opacity: 0;
    transition: visibility 0s 0.5s, opacity 0.25s; /* 延迟显示 */
}

.q-tooltips:hover .q-tooltips-div{
    visibility: visible;
    opacity: 1;
    transition-delay: 0.25s;
}

.send-btn-wrap {
    transition: all 0.25s ease-in-out !important; /* 过渡效果 */
    box-sizing: border-box;
}

.send-btn-wrap.active {
    border: 1px solid #66ccff; /* 激活时边框颜色 */
}


/*下面是下载DIV相关的样式*/

.ec-file-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    min-width: 300px;
    width: fit-content;
    margin: 3px;
    font-family: Arial, sans-serif;
}

.ec-file-info {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: #f9f9f9;
    flex-direction: column;
    justify-content: center;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}

.ec-file-icon {
    display: flex;
    justify-content: center;
    width: 75px;
    height: 75px;
}

.ec-file-name {
    margin: 0;
    font-size: 20px; /* 增大字体 */
    font-weight: bold; /* 加粗字体 */
    color: #2c3e50; /* 使用更深的颜色 */
    margin-bottom: 5px; /* 增加底部间距 */
}

.ec-file-size {
    font-size: 16px;
    color: #777;
    margin-top: 2px; /* 增加顶部间距 */
}

.ec-download-button {
    background-color: #66ccff;
    color: white;
    border: none;
    border-radius: 0 0 8px 8px;
    width: 100%;
    font-size: 20px;
    font-weight: bold; /* 加粗字体 */
    cursor: pointer;
    transition: 0.25s ease-in-out;
    padding: 10px;
    margin:0;
}

.ec-download-button:hover {
    background-color: #5bb8e5; /* 悬停时稍微加深背景色 */
}

.ec-loading-img {
    position: absolute;
    left: 100%;
    width: 35px;
    height: auto;
    color: ${currentConfig.mainColor};
}

}`

    style.innerHTML = sHtml

    document.getElementsByTagName('head')[0].appendChild(style)
    console.log('[Encrypt-Chat]' + 'css加载完成')
}

export async function rePatchCss() {
    console.log("[EC]调用rePatchCss")

    currentConfig = await ecAPI.getConfig()
    patchCss()//重新插入
    document.getElementById('encrypt-chat-css').remove()
    //原理：搜索元素只会搜索到第一个，而我们插入的是新的，第二个，没问题
}

/**
 * 检查消息元素是否需要修改，不能进程间通讯，因为只能传朴素值
 * @param msgElement
 * @returns {Promise}
 */
export async function checkMsgElement(msgElement) {
    if (!msgElement?.classList) return false; //如果元素没有classList属性，直接返回，因为可能是图片元素
    if (!msgElement?.innerText.trim()) return false; //如果消息为空，则不修改

    let decodeRes = await ecAPI.decodeHex(msgElement.innerHTML)//解码消息

    return decodeRes === "" ? false : decodeRes    //直接返回解密的结果，是十六进制的字符串,解码失败则不修改
}

/**
 * 消息渲染器，把密文渲染成明文
 * @param allChats
 * @returns {Promise<void>}
 */
export async function messageRenderer(allChats) {//下面对每条消息进行判断
    for (const chatElement of allChats) {
        try {
            const msgContentContainer = chatElement.querySelector('.msg-content-container')
            if (!msgContentContainer || msgContentContainer?.classList.contains('decrypted-msg-container') ||
                msgContentContainer?.classList.contains('reply-msg-checked')) continue//说明这条消息已经被修改过

            const msgContent = chatElement.querySelector('.message-content')//包裹着所有消息的div
            let isECMsg = false//判断是否是加密消息
            let totalOriginalMsg = ""//总的原始消息

            if (!msgContent?.children) continue;

            //接下来对所有的消息进行处理
            for (const singalMsg of msgContent?.children) {
                let hexString = undefined

                const normalText = singalMsg.querySelector('.text-normal')
                const atText = singalMsg.querySelector('.text-element--at')
                const imgElement = singalMsg.querySelector('.image-content')
                const mixContent = singalMsg.querySelector('.mixed-container')

                //接下来先对引用消息进行解密处理。
                if (mixContent) {
                    msgContentContainer.classList.add('reply-msg-checked')
                    for (const child of mixContent.children) {
                        hexString = await checkMsgElement(child)
                        if (hexString) {
                            //pluginLog('检测到加密回复消息')
                            const decryptedMsg = await ecAPI.messageDecryptor(hexString)
                            if (!decryptedMsg) continue//解密后如果消息是空的，那就直接忽略，进入下次循环
                            //直接修改内容
                            child.innerText = decryptedMsg
                            //添加已解密tag，防止对同一条引用消息多次解密
                        }
                    }
                }

                //是文本消息。需要具体判断是文件还是普通图片
                if (normalText) {
                    hexString = await checkMsgElement(normalText)


                    if (hexString) {
                        const decryptedMsg = await ecAPI.messageDecryptor(hexString)
                        if (!decryptedMsg) continue//解密后如果消息是空的，那就直接忽略，进入下次循环

                        //这里开始判断是否是文件
                        if (decryptedMsg.includes('ec-encrypted-file')) {
                            totalOriginalMsg = '[EC文件]'//注意这里是直接=，因为如果是文件只可能有一个Msg。

                            //建立个函数进行fileDiv处理
                            await fileDivCreater(msgContent, JSON.parse(decryptedMsg))

                        } else {
                            totalOriginalMsg += normalText.innerText//获取原本的密文
                            normalText.innerText = decryptedMsg
                        }
                        isECMsg = true
                    }//文本内容修改为解密结果

                } else if (atText) {
                    totalOriginalMsg += atText.innerText

                    //下面检测是否为图片元素
                } else if (imgElement) {

                    if (imgElement.getAttribute('src').includes('base64')) continue  //图片是base64格式的，直接跳过

                    let imgPath = decodeURIComponent(imgElement.getAttribute('src')).substring(9)//前面一般是appimg://
                    if (imgPath.includes('Thumb') && imgPath.includes('.gif')) {

                        if (imgPath.includes('_720.gif') && !imgElement.classList.contains('ec-transformed-img')) {//说明是加密的缩略图，可能需要请求原图
                            imgElement.classList.add('ec-transformed-img')//添加标记，避免重复调用
                            console.log('检测到加密缩略图！')

                            const curAioData = app.__vue_app__.config.globalProperties.$store.state.common_Aio.curAioData
                            const msgId = chatElement.id
                            const elementId = imgElement.parentElement.getAttribute('element-id')
                            const chatType = curAioData.chatType
                            const peerUid = curAioData.header.uid
                            const oriImgPath = imgPath.replace(/\/Thumb\//, '/Ori/').replace(/_\d+\.gif/, '.gif')

                            if (await ecAPI.isFileExist([oriImgPath])) {
                                continue
                            } //文件已存在，无需下载，直接继续即可。

                            //添加一个加载中的动画
                            appendLoadingImg(msgContentContainer)

                            await downloadOriImg(msgId, elementId, chatType, peerUid, oriImgPath)//下载原图

                            //下面就监听图片元素变化，变化了就删掉loading
                            new MutationObserver(() => {
                                console.log('删除loading元素')
                                msgContentContainer.removeChild(msgContentContainer.querySelector('.ec-loading-img'))
                                console.log('loading元素删除成功')
                            }).observe(imgElement, {attributes: true, attributeFilter: ['src']})

                        }

                        imgPath = imgPath.replace(/\/Thumb\//, '/Ori/').replace(/_\d+\.gif/, '.gif')//替换成原图地址
                        //console.log('检测到缩略图！索引到原图地址为' + imgPath)
                    }
                    if (!(await ecAPI.imgChecker(imgPath))) {
                        continue //图片检测未通过
                    }

                    //下面进行图片解密
                    // console.log('图片校验通过！')
                    msgContentContainer.classList.add('message-encrypted-tip-parent')//调整父元素的style

                    const decryptedObj = await ecAPI.imgDecryptor(imgPath)
                    const decryptedImgPath = decryptedObj.decryptedImgPath
                    if (decryptedImgPath)  //解密成功才继续
                    {
                        //拿到解密后的图片的本地地址，进行替换。
                        imgElement.setAttribute('src', decryptedImgPath)
                        //更改父亲的宽高属性
                        imgElement.parentElement.style.width = decryptedObj.width + 'px'
                        imgElement.parentElement.style.height = 'auto'

                        isECMsg = true

                        //添加一个监听器。保持宽高不变
                        new MutationObserver((imgEl) => {
                            imgElement.parentElement.style.width = decryptedObj.width + 'px'
                            imgElement.parentElement.style.height = 'auto'
                        }).observe(imgElement.parentElement, {attributes: true, attributeFilter: ['style']})

                    }
                    totalOriginalMsg += isECMsg ? "[EC图片]" : '[图片]'
                }


            }
            if (isECMsg) {
                //包裹住消息内容的div msg-content-container
                appendEncreptedTag(msgContentContainer, totalOriginalMsg)//全部处理完成添加已解密消息标记，同时修改样式
            }
        } catch
            (e) {
            console.log(e)
        }

    }
}

/**
 * 渲染file下载元素
 * @param {Element} msgContent
 * @param {Object} fileObj
 */
async function fileDivCreater(msgContent, fileObj) {
    msgContent.innerHTML = `
<div class="ec-file-card">
    <div class="ec-file-info">
            <h3 class="ec-file-name">文件名.txt</h3>
            
            <svg class="ec-file-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#B7B7B7">
            <path d="M480-325 288.5-516.5l52-53 102 102V-790h75v322.5l102-102 52 53L480-325ZM245-170q-30.94 0-52.97-22.03Q170-214.06 170-245v-117.5h75V-245h470v-117.5h75V-245q0 30.94-22.03 52.97Q745.94-170 715-170H245Z"/></svg>
        
            <p class="ec-file-size">大小: xx MB</p>
    </div>
    
    <div class="progress" style="display: none; color: #007BFF">
        <div class="progress-bar" style="width: 0; height: 5px; background: #0078ff;"></div>
    </div>
    <button class="ec-download-button" data-url="${fileObj.fileUrl}">下载</button>
    
</div>`
    //修改文件名字和大小
    msgContent.querySelector('.ec-file-name').innerText = fileObj.fileName
    msgContent.querySelector('.ec-file-size').innerText = '大小：' + formatFileSize(fileObj.fileSize)

    //接下来判断该文件是否已经完成下载
    if (await ecAPI.isFileExist([currentConfig.downloadFilePath, fileObj.fileName])) {
        //文件已经完成了下载，直接显示打开目录按钮即可
        console.log('文件已完成下载')
        msgContent.querySelector('.ec-file-icon').innerHTML = `<path d="M383-327 167.5-542.5 221-596l162 162 356-356 53.5 53.5L383-327ZM210-170v-70h540v70H210Z"/>`
        msgContent.querySelector('.ec-download-button').innerText = '打开文件目录'
        msgContent.querySelector('.ec-download-button').addEventListener('click', () => {    //再次添加一个事件监听器
            ecAPI.openPath(currentConfig.downloadFilePath)
        })
    } else {
        // 添加下载按钮的点击事件
        const funcReference = downloadFunc(fileObj, msgContent)
        fileObj.downloadFunc = funcReference
        msgContent.querySelector('.ec-download-button').addEventListener('click', funcReference)
    }
}

/**
 * 添加加载中图标
 * @param msgContentContainer
 */
function appendLoadingImg(msgContentContainer) {
    const imgElement = document.createElement('img')
    imgElement.src = currentConfig.pluginPath + '/src/assests/loading.svg'
    imgElement.classList.add('ec-loading-img')
    msgContentContainer.classList.add('message-encrypted-tip-parent')//调整父元素的style
    msgContentContainer.appendChild(imgElement)
}


/**
 *添加解密消息标记，显示在QQ消息的下方，以小字的形式显示
 * @param msgContentContainer
 * @param originaltext
 */
export function appendEncreptedTag(msgContentContainer, originaltext) {
    // console.log('[appendTag]' + '开始判断')
    // if (!currentConfig.enableTip) return;//没开这个设置就不添加解密标记
    //console.log('[appendTag]' + '判断成功，准备加tag')

    if (msgContentContainer.classList.contains('decrypted-msg-container')) return//添加标记，用来检测是否为已修改过的元素

    const tipElement = document.createElement('div')
    tipElement.innerText = '原消息：' + originaltext

    //下面先判断是自己发的消息还是别人发的消息
    if (msgContentContainer?.classList.contains('container--others')) {
        //不为空，说明是别人的消息
        tipElement.classList.add('message-encrypted-tip-left')//添加tip类名
        msgContentContainer.classList.add('message-encrypted-tip-parent')//调整父元素的style
        msgContentContainer.appendChild(tipElement)
    } else {
        tipElement.classList.add('message-encrypted-tip-right')//添加tip类名
        msgContentContainer.classList.add('message-encrypted-tip-parent')//调整父元素的style
        msgContentContainer.appendChild(tipElement)
    }

    msgContentContainer.classList.add('decrypted-msg-container')//添加标记，用来检测是否为已修改过的元素
    setTimeout(() => {
        tipElement.style.transform = "translateX(0)";
        tipElement.style.opacity = "0.8";
    }, 100);
}

/**
 * 下载源图片
 * @returns {Promise<void>}
 * @param msgId     消息ID
 * @param elementId 元素ID
 * @param chatType  聊天类型
 * @param peerUid   当前的uid，群聊是群号，私聊是Q号对应的一个字符串
 * @param filePath  文件路径
 */
export async function downloadOriImg(msgId, elementId, chatType, peerUid, filePath) {
    console.log('正在尝试下载原图')
    console.log(`具体参数为：msgId：${msgId}，elementId:${elementId}，chatType:${chatType}，peerUid:${peerUid}，filePath:${filePath}`)
    //先检查图片是否已经在本地存在
    const result = await ecAPI.invokeNative("ns-ntApi", "nodeIKernelMsgService/downloadRichMedia"
        , false, window.webContentId, {
            "getReq": {
                "fileModelId": "0",
                "downSourceType": 0,
                "triggerType": 1,
                "msgId": msgId,
                "chatType": chatType,//1是个人，2是群聊
                "peerUid": peerUid,//如果是群，这里会是群号
                "elementId": elementId,
                "thumbSize": 0,
                "downloadType": 1,
                "filePath": filePath
            }
        })
    console.log(JSON.stringify(result))
}


function formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}

function downloadFile(fileObj, msgContent) {
    const progressElement = msgContent.querySelector('.progress')
    const iconElement = msgContent.querySelector('.ec-file-icon') //下载的图标元素
    const downloadButton = msgContent.querySelector('.ec-download-button')

    //现在开始下载，修改图标为下载中状态，并且不能再被点击
    iconElement.innerHTML = `<path d="M440-92q-74.5-8-138.25-41.5t-110.5-85.75q-46.75-52.25-73.5-119.5T91-481q0-151 100-262t250-127v75q-119 17-197 105.75T166-481q0 119.5 78 208.25T440-167v75Zm39-194.5L283-483l53-53 106 106v-246.5h75V-431l104-104 53 53.5-195 195ZM518-92v-75q42.5-6 81.5-22.5T672-232l55 55q-46 36-98.75 57.5T518-92Zm156-638q-34.5-25.5-73.5-42.25T519-795v-75q57.5 6 110.25 27.5T727-785l-53 55Zm108 496-53-53.5q25.5-34 41.25-73T792-442h77q-8 57.5-29 110.75T782-234Zm10-286q-6-42.5-21.75-81.5t-41.25-73l53-53.5q37 44 59 97.25T869-520h-77Z"/>`
    downloadButton.innerText = '下载中'
    downloadButton.disabled = true//设置为不可点击
    try {
        console.log('准备开始下载文件')
        //显示进度条
        progressElement.style.display = 'flex'

        //下面使用axios库进行下载
        axios({
            url: fileObj.fileUrl,
            method: 'GET',
            responseType: 'arraybuffer',
            onDownloadProgress: (progressEvent) => {
                const total = progressEvent.total
                const current = progressEvent.loaded
                const percentCompleted = (current / total) * 100
                //更新进度条
                progressElement.querySelector('.progress-bar').style.width = percentCompleted + '%';
            }
        }).then(response => {
            //通过IPC发送到主进程
            progressElement.style.display = 'none'
            console.log(response.data)
            console.log(JSON.stringify(response, null, 4))
            ecAPI.ecFileHandler(response.data, fileObj.fileName)
            //下载完成，图标修改为下载完成状态
            iconElement.innerHTML = `<path d="M383-327 167.5-542.5 221-596l162 162 356-356 53.5 53.5L383-327ZM210-170v-70h540v70H210Z"/>`
            //下面的下载按钮要改成打开所在目录
            downloadButton.disabled = false//切换为可点击状态
            downloadButton.innerText = '打开文件目录'
            downloadButton.removeEventListener('click', fileObj.downloadFunc)
            downloadButton.addEventListener('click', () => {    //再次添加一个事件监听器
                ecAPI.openPath(currentConfig.downloadFilePath)
            })

        }).catch(error => {
            console.log('下载失败,', error)
            iconElement.innerHTML = `<path d="M480-325 288.5-516.5l52-53 102 102V-790h75v322.5l102-102 52 53L480-325ZM245-170q-30.94 0-52.97-22.03Q170-214.06 170-245v-117.5h75V-245h470v-117.5h75V-245q0 30.94-22.03 52.97Q745.94-170 715-170H245Z"/>`
        })
    } catch (e) {
        console.log(e)
    }
}


// const fileObj={
//     type:'ec-encrypted-file',
//     fileName: fileName,
//     fileUrl:result.url,
//     fileSize: fileSize,
//     encryptionKey:config.encryptionKey  //直接放上加密文件的key
// }