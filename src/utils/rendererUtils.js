//添加css样式
import {appendEncreptedTag} from "./frontendUtils.js";
const ecAPI=window.encrypt_chat
const nowConfig = await ecAPI.getConfig()

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

/**
 * 检查消息元素是否需要修改，不能进程间通讯，因为只能传朴素值
 * @param msgElement
 * @returns {Promise}
 */
export async function checkMsgElement(msgElement) {
    if (!msgElement?.classList) return false; //如果元素没有classList属性，直接返回，因为右键的不一定是文字元素
    if (msgElement.classList.contains('message-encrypted')) return false; //已修改则不再修改
    if (!msgElement?.innerText) return false; //如果消息为空，则不修改

    let decodeRes = await window.encrypt_chat.decodeHex(msgElement.innerHTML)//解码消息
    if (!decodeRes) return false; //如果消息解码失败，则不修改
    return decodeRes    //直接返回解密的结果，是十六进制的字符串
}

/**
 * 消息渲染器，把密文渲染成明文
 * @param allChats
 * @returns {Promise<void>}
 */
export async function messageRenderer(allChats){//下面对每条消息进行判断
    for (let chatElement of allChats) {
        const innerChatElement = chatElement.querySelector('.text-normal')
        //包裹住消息内容的div msg-content-container
        const msgContentContainer = chatElement.querySelector('.msg-content-container')

        const hexString = await checkMsgElement(innerChatElement)
        if (!hexString) continue; //如果消息元素不符合加密解密条件，则不修改

        //解密消息并替换消息
        const originalText = innerChatElement.innerText//获取原本的密文
        const decryptedMsg = await window.encrypt_chat.messageDecrypter(hexString)

        innerChatElement.innerText = decryptedMsg === "" ? "[EC]解密失败" : decryptedMsg//文本内容修改为解密结果
        innerChatElement.classList.add('message-encrypted') //标记已修改

        appendEncreptedTag(msgContentContainer, originalText)//添加解密消息标记

    }}