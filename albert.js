function genEBridge(APIS) {


    const channel = "__trigger"
    const e_property = "__electron_api"

    function getNestedProperty(obj, path) {
        const keys = path.split('.');
        return keys.reduce((acc, key) => {
            return acc && acc[key] !== undefined ? acc[key] : undefined;
        }, obj);
    }

    async function runElectronFunc(action, ...args) {
        // noinspection JSUnresolvedReference
        return await window[e_property]?.[channel]?.({
            action,
            args
        })
    }

    function genApiProxy(callback, currentPath = null) {
        const path = currentPath
        return new Proxy((...args) => callback(path, args), {
            get(target, key) {
                let newPath = key
                if (path) {
                    newPath = path + '.' + key
                }
                return genApiProxy(callback, newPath)
            }
        })
    }

    return {
        listener: [channel, async (event, data) => {
            let {action, args} = data
            return await getNestedProperty(APIS, action)?.(...args)
        }],
        eAPI: genApiProxy((path, args) => {
            return runElectronFunc(path, args)
        }),
    }

}

const EBridge = genEBridge({
    hh() {
        console.log('我去 牛逼')
        return '太牛逼了'
    },
})

ipcMain.handle(...EBridge.listener)