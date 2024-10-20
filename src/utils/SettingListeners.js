const ecAPI = window.encrypt_chat

export class SettingListeners {
    listNum = 0;
    keyList = [];//调用onLoad方法之后会改变
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
            //console.log('修改密钥为' + keyValue)
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
            //console.log('[EC]修改主题色为' + keyValue)
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
            console.log('[EC]语种设置为' + keyValue)
        })
    }

    async tagButtonListener() {
        const tagButton = this.document.querySelector('#ec-tag-button')
        // console.log(tagButton)
        // console.log((await ecAPI.getConfig()).isUseTag)
        if ((await ecAPI.getConfig()).isUseTag) tagButton.classList.toggle('is-active')

        tagButton.addEventListener('click', async () => {
            const isUseTag = (await ecAPI.getConfig()).isUseTag
            tagButton.classList.toggle('is-active')
            await ecAPI.setConfig({isUseTag: !isUseTag})
        })
    }

    async enhanceAreaButtonListener() {
        const button = this.document.querySelector('#ec-enhance-input-area-button')
        if ((await ecAPI.getConfig()).isUseEnhanceArea) button.classList.toggle('is-active')

        button.addEventListener('click', async () => {
            const isUseEnhanceArea = (await ecAPI.getConfig()).isUseEnhanceArea
            button.classList.toggle('is-active')
            await ecAPI.setConfig({isUseEnhanceArea: !isUseEnhanceArea})
        })
    }

    async addKeyRowButtonListener() {
        this.document.querySelector('.add-row-button').addEventListener('click', async () => {
            //点击按钮之后，应该多出一行设置栏，并且配置列表添加新的空行
            const container = this.document.querySelector('.key-list-container')
            const keyObj = {note: '', id: '', key: ''}
            this.keyList.push(keyObj)
            await ecAPI.setConfig({independentKeyList: this.keyList})//发送ipcMsg给主进程，更新配置文件
            this.addKeyRowHtml(container)
        })
    }

    //初始化独立key列表
    async initIndependentKeyList() {

        const container = this.document.querySelector('.key-list-container')
        this.keyList.forEach(item => {
            this.addKeyRowHtml(container, item.note, item.id, item.key)
        })
    }

    addKeyRowHtml(container, note = '', id = '', key = '') {
        const rowDiv = document.createElement('div')
        const noteDiv = document.createElement('div')
        const idDiv = document.createElement('div');
        const keyDiv = document.createElement('div');
        const deleteButton = document.createElement('button');
        rowDiv.className = "vertical-list-item singal-key-row";
        noteDiv.className = "independent-key-div";
        idDiv.className = "independent-key-div";
        keyDiv.className = "independent-key-div";
        deleteButton.className = 'q-button q-button--secondary q-button--large delete-row-button';

        noteDiv.innerHTML = `
            <h2 style="margin-right: 5px">备注</h2>
            <input data-type="primary" class="q-input__inner q-input__inner--clearable custom-input independent-key-input"
                   type="text" placeholder="ID和密钥的备注" value="${note}">`;

        idDiv.innerHTML = `
            <h2 style="margin-right: 5px">群号</h2>
            <input data-type="primary" class="q-input__inner q-input__inner--clearable custom-input independent-key-input"
                   type="text" placeholder="QQ群号" value="${id}">`;

        keyDiv.innerHTML = `
            <h2 style="margin-right: 5px">密钥</h2>
            <input data-type="primary" class="q-input__inner q-input__inner--clearable custom-input independent-key-input"
                   type="text" placeholder="双方需一致" value="${key}">`;

        deleteButton.textContent = '×';

        //下面应该给所有的栏目加上监听器。
        //备注监听器
        const currentListNum = this.listNum++;//用来方便对应数组下标
        const keyObj = {note: note, id: id, key: key}

        noteDiv.querySelector('input').addEventListener('change', async event => {
            keyObj.note = event.target.value//更新对象

            this.keyList[currentListNum] = keyObj//更新数组

            await ecAPI.setConfig({independentKeyList: this.keyList})//发送ipcMsg给主进程，更新配置文件
        })

        idDiv.querySelector('input').addEventListener('change', async event => {
            keyObj.id = event.target.value//更新对象
            this.keyList[currentListNum] = keyObj//更新数组

            await ecAPI.setConfig({independentKeyList: this.keyList})//发送ipcMsg给主进程，更新配置文件
        })

        keyDiv.querySelector('input').addEventListener('change', async event => {
            keyObj.key = event.target.value//更新对象
            this.keyList[currentListNum] = keyObj//更新数组

            await ecAPI.setConfig({independentKeyList: this.keyList})//发送ipcMsg给主进程，更新配置文件
        })

        //下面给删除按钮添加对应方法。
        deleteButton.addEventListener('click', async () => {
            this.keyList.splice(currentListNum, 1)
            await ecAPI.setConfig({independentKeyList: this.keyList})//发送ipcMsg给主进程，更新配置文件
            rowDiv.remove()
        })

        rowDiv.appendChild(noteDiv);
        rowDiv.appendChild(idDiv);
        rowDiv.appendChild(keyDiv);
        rowDiv.appendChild(deleteButton);
        rowDiv.setAttribute('data-list-id', String(currentListNum))


        container.appendChild(rowDiv);
    }

    async onLoad() {
        this.keyList = (await ecAPI.getConfig()).independentKeyList;
        this.keyInputListener()
        this.colorSelectorListener()
        this.styleSelectorListener()
        this.tagButtonListener()
        this.enhanceAreaButtonListener()
        this.addKeyRowButtonListener()
        this.initIndependentKeyList()
    }
}
