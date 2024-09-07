const ecAPI=window.encrypt_chat
export class SettingListeners {
    constructor(doc) {//传入一个document对象
        this.document = doc
    }

    keyInputListener() {
        let keyValue = undefined
        const keyInputEl = this.document.querySelector('#ec-key-input')
        keyInputEl.addEventListener('change', async event => {
            keyValue = event.target.value

            const config = await ecAPI.getConfig()
            config.

            console.log('修改值为' + keyValue)
        })
    }

    onLoad(){
        this.keyInputListener()
    }
}
