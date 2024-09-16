const ecAPI = window.encrypt_chat

/**
 * 图片查看器处理器。把加密的图片解密后呈现。
 * @param imgElement
 */
export async function imgViewHandler(imgElement) {
    const imgPath = decodeURIComponent(imgElement.getAttribute('src')).substring(9)
    if (!(await ecAPI.imgChecker(imgPath))) {
        console.log('图片校验未通过！')
        return
    }

    //下面进行图片解密
    console.log('图片校验通过！')
    const decryptedObj = await ecAPI.imgDecryptor(imgPath)
    const decryptedImgPath = decryptedObj.decryptedImgPath
    if (decryptedImgPath)  //解密成功才继续
    {
        //拿到解密后的图片的本地地址，进行替换。
        imgElement.setAttribute('src', decryptedImgPath)
        //更改父亲的宽高属性
        imgElement.parentElement.style.width = decryptedObj.width + 'px'
        imgElement.parentElement.style.height = decryptedObj.height + 'px'

    }
}