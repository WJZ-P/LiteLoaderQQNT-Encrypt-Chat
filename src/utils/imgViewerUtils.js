const ecAPI = window.encrypt_chat

/**
 * 图片查看器处理器。把加密的图片解密后呈现。
 * @param imgElement
 */
export async function imgViewHandler(imgElement) {

    if(imgElement.classList.contains('modified-img')) return//图片已经更改完成，不需要再次修改

    imgElement.classList.add('modified-img')
    const imgPath = decodeURIComponent(imgElement.src).substring(9)
    if (!(await ecAPI.imgChecker(imgPath))) {
        //console.log('图片校验未通过！')
        return
    }


    //下面进行图片解密
    //console.log('图片校验通过！')
    const decryptedObj = await ecAPI.imgDecryptor(imgPath)
    const decryptedImgPath = decryptedObj.decryptedImgPath
    if (decryptedImgPath)  //解密成功才继续
    {
        //拿到解密后的图片的本地地址，进行替换。
        imgElement.setAttribute('src', decryptedImgPath)
        //给父亲元素加类名
        imgElement.parentElement.classList.add('fix-size')

        //更改父亲的宽高属性
        //patchCss(decryptedObj.width, decryptedObj.height)
        //注：现在可以直接修改IPC了。
    }
}

/**
 * 传入宽高，设置图片
 * @param width
 * @param height
 */
function patchCss(width, height) {
    console.log('[Encrypt-Chat]' + '用于固定图片宽高的css加载中')

    let style = document.createElement('style')
    style.type = "text/css";
    style.id = "encrypt-chat-css";

    style.innerHTML = `
.fix-size {
    width: ${width + 'px !important'};
    height: ${height + 'px !important'};
}
`

    document.getElementsByTagName('head')[0].appendChild(style)
    console.log('[Encrypt-Chat]' + 'imgViewerWindow css加载完成')
}
