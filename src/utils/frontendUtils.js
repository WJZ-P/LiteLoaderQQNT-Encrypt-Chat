/**
 *添加解密消息标记，显示在QQ消息的下方，以小字的形式显示
 * @param msgElement
 * @param originaltext
 * @param isSuccess
 */
export function appendEncreptedTag(msgElement, originaltext) {
    console.log('[appendTag]' + '开始判断')
    //先判断是否符合条件
    if (msgElement.querySelector('.message-encrypted-tip') != null) return;//有标记就不用加
    // if (!nowConfig.enableTip) return;//没开这个设置就不添加解密标记

    console.log('[appendTag]' + '判断成功，准备加tag')

    const tipElement = document.createElement('div')
    tipElement.innerText = '原信息：' + originaltext

    //下面先判断是自己发的消息还是别人发的消息
    if (msgElement.querySelector('.text-element--other') != null) {
        //不为空，说明是别人的消息
        tipElement.classList.add('message-encrypted-tip-left')//添加tip类名
        msgElement.classList.add('message-encrypted-tip-parent')//调整父元素的style
        msgElement.appendChild(tipElement)
    }
    else{
        tipElement.classList.add('message-encrypted-tip-right')//添加tip类名
        msgElement.classList.add('message-encrypted-tip-parent')//调整父元素的style
        msgElement.appendChild(tipElement)
    }

    setTimeout(() => {
        tipElement.style.transform = "translateX(0)";
        tipElement.style.opacity = "0.8";
    }, 10);
}