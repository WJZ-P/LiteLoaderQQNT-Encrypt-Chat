const ecAPI = window.encrypt_chat

export class SettingListeners {
    constructor(doc) {//传入一个document对象
        this.document = doc
    }

    async keyInputListener() {
        let keyValue = undefined
        const keyInputEl = this.document.querySelector('#ec-key-input')
        keyInputEl.value = (await ecAPI.getConfig()).encryptionKey

        keyInputEl.addEventListener('change', async event => {
            keyValue = event.target.value

            // 发送设置密钥事件
            await ecAPI.setConfig({encryptionKey: keyValue})
            console.log('修改密钥为' + keyValue)
        })
    }

    async colorSelectorListener() {
        let keyValue = undefined
        const colorSelEl = this.document.querySelector('#ec-color-selector')
        colorSelEl.value = (await ecAPI.getConfig()).mainColor

        colorSelEl.addEventListener('change', async event => {
            keyValue = event.target.value
        })

        // 发送设置密钥事件
        await ecAPI.setConfig({mainColor: keyValue})
        console.log('[EC]修改主题色为' + keyValue)
    }

    onLoad() {
        this.keyInputListener()
        this.colorSelectorListener()
    }
}
