class SettingListeners{
    constructor(doc) {//传入一个document对象
        this.document= doc
    }


}

export function keyInputListener() {
    let keyValue=undefined
    const keyInputEl = document.getElementById('ec-key-input')
    keyInputEl.addEventListener('change', event => {
        keyValue=event.target.value
        console.log('值为'+keyValue)
    })
}