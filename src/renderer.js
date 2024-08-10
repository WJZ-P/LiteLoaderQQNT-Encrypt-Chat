import {test123} from "./MenuUtils";
// 运行在 Electron 渲染进程 下的页面脚本
// 打开设置界面时触发
export const onSettingWindowCreated = view => {
    // view 为 Element 对象，修改将同步到插件设置界面
    // 这个函数导出之后在QQ设置里面可以直接看见插件页面
     // 创建一个新的 div 元素
    const div = document.createElement('div');
    div.textContent = '嘻嘻哈哈，哇嘎哇嘎';

    // 将 div 元素添加到 view 对象中
    view.appendChild(div);
}

test123()