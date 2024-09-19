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

            // 发送设置密钥事件
            await ecAPI.setConfig({mainColor: keyValue})
            //rePatchCss()
            //不应该在这里调用rePatchCss，因为窗口不对。在这里是对设置窗口本身修改，没用。
            //在setConfig里有设置。如果修改了主题色，主进程会对所有聊天窗口发送ipcMsg。
            //渲染进程收到后进行修改主题色。
            console.log('[EC]修改主题色为' + keyValue)
        })
    }

    async styleSelectorListener() {
        let keyValue = undefined
        const styleSelEl = this.document.querySelector('#ec-style-selector')
        styleSelEl.value = (await ecAPI.getConfig()).currentStyleName

        styleSelEl.addEventListener('change', async event => {
            keyValue = event.target.value

            // 发送设置密钥事件
            await ecAPI.setConfig({currentStyleName: keyValue})
            console.log('[EC]语种设置为'+keyValue)
        })
    }

    onLoad() {
        this.keyInputListener()
        this.colorSelectorListener()
        this.styleSelectorListener()
    }
}
