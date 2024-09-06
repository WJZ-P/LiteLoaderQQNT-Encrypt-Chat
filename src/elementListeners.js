let document=undefined
export function setDocument(QQdocument){
    document=QQdocument
}

export function keyInputListener() {
    let keyValue=undefined
    const keyInputEl = document.getElementById('ec-key-input')
    keyInputEl.addEventListener('change', event => {
        keyValue=event.target.value
        console.log('值为'+keyValue)
    })
}