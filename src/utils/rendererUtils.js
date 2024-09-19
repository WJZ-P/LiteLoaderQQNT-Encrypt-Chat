//添加css样式
const ecAPI = window.encrypt_chat
let nowConfig = await ecAPI.getConfig()

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
                color:${nowConfig.mainColor};
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
                color:${nowConfig.mainColor};
            }
            
            .message-encrypted-tip-parent {
                border-radius: 10px;
                position: relative;
                overflow: unset !important;
                margin-top:3px;
                margin-left:3px;
                margin-right:3px;
                margin-bottom: 25px;
                box-shadow: 0px 0px 8px 5px ${nowConfig.mainColor};
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

}`

    style.innerHTML = sHtml

    document.getElementsByTagName('head')[0].appendChild(style)
    console.log('[Encrypt-Chat]' + 'css加载完成')
}

export async function rePatchCss() {
    console.log("[EC]调用rePatchCss")

    nowConfig = await ecAPI.getConfig()
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
            if (!msgContentContainer || msgContentContainer?.classList.contains('decrypted-msg-container')) continue//说明这条消息已经被修改过

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
                            fileDivCreater(msgContent, JSON.parse(decryptedMsg))

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
                        imgPath = imgPath.replace(/\/Thumb\//, '/Ori/').replace(/_\d+\.gif/, '.gif')//替换成原图地址
                        //console.log('检测到缩略图！索引到原图地址为' + imgPath)
                    }
                    if (!(await ecAPI.imgChecker(imgPath))) {
                        continue //图片检测未通过
                    }
                    //下面进行图片解密
                    // console.log('图片校验通过！')
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
function fileDivCreater(msgContent, fileObj) {
    msgContent.innerHTML = `
<div class="ec-file-card">
    <div class="ec-file-info">
        <img id="ec-download-img" src="/src/assests/download.svg" alt="文件图标" class="file-icon">
        <div class="ec-file-details">
            <h3 class="ec-file-name">文件名.txt</h3>
            <p class="ec-file-size">大小: 1.5 MB</p>
        </div>
    </div>
    <button class="download-button">下载</button>
</div>`

}


/**
 *添加解密消息标记，显示在QQ消息的下方，以小字的形式显示
 * @param msgContentContainer
 * @param originaltext
 */
export function appendEncreptedTag(msgContentContainer, originaltext) {
    // console.log('[appendTag]' + '开始判断')
    // if (!nowConfig.enableTip) return;//没开这个设置就不添加解密标记
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