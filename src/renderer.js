import {addFuncBar, addMenuItemEC} from "./MenuUtils.js";
import {appendEncreptedTag} from "./frontendUtils.js";
import {keyInputListener, setDocument} from "./elementListeners.js";

const nowConfig = {
    mainColor: '#66ccff',
    enableTip: true,
    secretKey: '20040821',//Kitten
}

onLoad();//注入


export const onSettingWindowCreated = view => {
    // view 为 Element 对象，修改将同步到插件设置界面
    // 这个函数导出之后在QQ设置里面可以直接看见插件页面


    //整个插件主菜单
    const pluginMenuHTML = `
<div class="config-menu config_view">
    <section class="path">
    <h1>主要配置</h1>
    <div class="wrap">
        <div class="list">
            <div class="vertical-list-item top-box">
                <div class="left-part">
                    <h2>配置密钥</h2>
                    <div style="display: flex; flex-direction: column">
                        <span class="secondary-text">密钥用于加密和解密信息，必须双方密钥一致才可以正常通信</span>
                    </div>

                </div>
                <input class="q-input__inner q-input__inner--clearable custom-input"
                       type="text" id="ec-key-input" placeholder="默认20040821">
            </div>
            <hr class="horizontal-dividing-line"/>
            <div class="vertical-list-item">
            
            </div>
        </div>
    </div>
    </section>
    
    <style>
          .custom-input{
            color: white;
          }
    
          .q-input__inner{
          border-radius: 2px;
          border: 1px solid #ccc;
            padding: 4px;
            font-size: 14px;
          }
          .left-part{
          display: flex;
          flex-direction: column;
          }
          
          .bq-icon {
            height:16px;
            width:16px;
          }
          
          /* 通用 */
          .config_view {
              margin: 20px;
          }
          
          .config_view h1 {
              color: var(--text_primary);
              font-weight: var(--font-bold);
              font-size: min(var(--font_size_3), 18px);
              line-height: min(var(--line_height_3), 24px);
              padding: 0px 16px;
              margin-bottom: 8px;
          }
          
          .config_view .wrap {
              /* Linux样式兼容：--fg_white */
              background-color: var(--fill_light_primary, var(--fg_white));
              border-radius: 8px;
              font-size: min(var(--font_size_3), 18px);
              line-height: min(var(--line_height_3), 24px);
              margin-bottom: 20px;
              overflow: hidden;
              padding: 0px 16px;
          }
          
          .config_view .vertical-list-item {
              margin: 12px 0px;
              display: flex;
              justify-content: space-between;
              align-items: center;
          }
          
          .config_view .horizontal-dividing-line {
              border: unset;
              margin: unset;
              height: 1px;
              background-color: rgba(127, 127, 127, 0.15);
          }
          
          .config_view .vertical-dividing-line {
              border: unset;
              margin: unset;
              width: 1px;
              background-color: rgba(127, 127, 127, 0.15);
          }
          
          .config_view .ops-btns {
              display: flex;
          }
          
          .config_view .hidden {
              display: none !important;
          }
          
          .config_view .disabled {
              pointer-events: none;
              opacity: 0.5;
          }
          
          .config_view .secondary-text {
              color: var(--text_secondary);
              font-size: min(var(--font_size_2), 16px);
              line-height: min(var(--line_height_2), 22px);
              margin-top: 4px;
          }
          
          .config_view .wrap .title {
              cursor: pointer;
              font-size: min(var(--font_size_3), 18px);
              line-height: min(var(--line_height_3), 24px);
          }
          
          .config_view .wrap .title svg {
              width: 1em;
              height: 1em;
              transform: rotate(-180deg);
              transition-duration: 0.2s;
              transition-timing-function: ease;
              transition-delay: 0s;
              transition-property: transform;
          }
          
          .config_view .wrap .title svg.is-fold {
              transform: rotate(0deg);
          }
          
          
          /* 模态框 */
          .config_view .modal-window {
              display: flex;
              justify-content: center;
              align-items: center;
              position: fixed;
              top: 0;
              right: 0;
              bottom: 0;
              left: 0;
              z-index: 999;
              background-color: rgba(0, 0, 0, 0.5);
          }
          
          .config_view .modal-dialog {
              width: 480px;
              border-radius: 8px;
              /* Linux样式兼容：--fg_white */
              background-color: var(--bg_bottom_standard, var(--fg_white));
          }
          
          .config_view .modal-dialog header {
              font-size: 12px;
              height: 30px;
              line-height: 30px;
              text-align: center;
          }
          
          .config_view .modal-dialog main {
              padding: 0px 16px;
          }
          
          .config_view .modal-dialog main p {
              margin: 8px 0px;
          }
          
          .config_view .modal-dialog footer {
              height: 30px;
              display: flex;
              justify-content: right;
              align-items: center;
          }
          
          .config_view .modal-dialog .q-icon {
              width: 22px;
              height: 22px;
              margin: 8px;
          }
          
          
          /* 版本号 */
          .config_view .versions .wrap {
              display: flex;
              justify-content: space-between;
              padding: 16px 0px;
          }
          
          .config_view .versions .wrap>div {
              flex: 1;
              margin: 0px 10px;
              border-radius: 8px;
              text-align: center;
          }
          
          
          /* 数据目录 */
          .config_view .path .path-input {
              align-self: normal;
              flex: 1;
              border-radius: 4px;
              margin-right: 16px;
              transition: all 100ms ease-out;
          }
          
          .config_view .path .path-input:focus {
              padding-left: 5px;
              background-color: rgba(127, 127, 127, 0.1);
          }
          
          /* 选择框容器 */
          .config_view .list-ctl .ops-selects {
              display: flex;
              gap: 8px;
          }
          

          @media (prefers-color-scheme: light) {
              .text_color {
                  color: black;
              }
          }
          
          @media (prefers-color-scheme: dark) {
              .text_color {
                  color: white;
              }
          }

        </style>
</div>

`
    const parser = new DOMParser()
    view.appendChild(parser.parseFromString(pluginMenuHTML, "text/html").querySelector(".config-menu"));
}

//注入函数
function onLoad() {
    console.log('下面执行onLoad方法')
    addMenuItemEC()//添加鼠标右键时的菜单选项
    patchCss()//修改css
    addFuncBar()//添加功能栏的功能图标
    addListeners()
}

/**
 * 添加插件设置界面的消息监听器，用来修改插件设置
 */
function addListeners() {
    keyInputListener()
}

//节流，防止多次渲染
let observerRendering = false
//聊天窗口监听器，在循环内被
const chatObserver = new MutationObserver(mutationsList => {
    if (observerRendering) return;

    observerRendering = true
    setTimeout(async () => {
        await render()
        observerRendering = false
    }, 50)
})

//聊天列表，所有聊天都显示在这里
const finder = setInterval(() => {
    if (document.querySelector(".ml-list.list")) {
        clearInterval(finder);
        console.log("[Encrypt-Chat]", "已检测到聊天区域");
        const targetNode = document.querySelector(".ml-list.list");
        //只检测childList就行了
        const config = {attributes: false, childList: true, subtree: false,};
        chatObserver.observe(targetNode, config);
    }
}, 100);

//渲染函数，修改文本
async function render() {
    //console.log('[Encrypt-Chat]'+'尝试渲染消息')
    let allChats = document.querySelectorAll('.ml-item')

    //下面对每条消息进行判断
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

    }
}

/**
 * 检查消息元素是否需要修改，不能进程间通讯，因为只能传朴素值
 * @param msgElement
 * @returns {Promise}
 */
async function checkMsgElement(msgElement) {
    if (!msgElement?.classList) return false; //如果元素没有classList属性，直接返回，因为右键的不一定是文字元素
    if (msgElement.classList.contains('message-encrypted')) return false; //已修改则不再修改
    if (!msgElement?.innerText) return false; //如果消息为空，则不修改

    let decodeRes = await window.encrypt_chat.decodeHex(msgElement.innerHTML)//解码消息
    if (!decodeRes) return false; //如果消息解码失败，则不修改
    return decodeRes    //直接返回解密的结果，是十六进制的字符串
}


//添加css样式
function patchCss() {
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

}`

    style.innerHTML = sHtml
    document.getElementsByTagName('head')[0].appendChild(style)
    console.log('[Encrypt-Chat]' + 'css加载完成')
}