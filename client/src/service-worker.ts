

const HOSTS: Record<string, string> =
{
    ...Object.fromEntries(Array.from(Array(15), (_, i) => [`linux${i + 1}`, `linux${i + 1}.csie.ntu.edu.tw`])),
    local: 'localhost'
};
const PORT = 5678;

function getUrl(host: string, path = '') {
    return `http://${HOSTS[host]}:${PORT}/${path}`;
}


async function getActiveTabId() {

    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tab.id!;
}
// (async function () {
//     const tabId = await getActiveTabId();
//     chrome.scripting.executeScript({ target: { tabId }, func: () => console.log('hi') });
// })();

async function getSelectionText(tabId: number) {
    const res = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => { return document.getSelection()?.toString(); }
    });
    return res[0].result;
}

(async function () {
    let res = await fetch(getUrl('linux1'));
    res = await res.json();
    console.log(res);

})();


const portMap: Map<number, chrome.runtime.Port> = new Map();
chrome.runtime.onConnect.addListener(port => {
    if (port.name != 'hackmd')
        return;

    const tabId: number = port.sender?.tab?.id!;
    portMap.set(tabId, port);

    port.onMessage.addListener((msg, sender) => {
        console.log(msg);
    });

});

import insertMessageElement1 from "./message";
function insertMessageElement() {
    console.log('original message');
    const body = document.getElementsByTagName('body')[0];

    const msgNode = document.createElement('div');
    msgNode.style.cssText = `
        background: red;
        width: 100px;
        z-index: 999;
        height: 100px;
        position: fixed;
        top: 0;
        left: 50%;
    `;

    body.appendChild(msgNode);
}

chrome.contextMenus.onClicked.addListener(genericOnClick);
async function genericOnClick(info: chrome.contextMenus.OnClickData) {


    const tabId = await getActiveTabId();
    const content = await getSelectionText(tabId);

    const route = info.menuItemId + '/';
    let res = await fetch(getUrl('linux1', route), {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: { "Content-Type": "application/json" },
    });

    res = await res.json();

    console.log('result from server:' + res);
    chrome.scripting.executeScript({ target: { tabId }, func: insertMessageElement1, args: [] });
    // portMap.get(tabId)?.postMessage(res);
}

chrome.runtime.onInstalled.addListener(function () {

    chrome.contextMenus.create({
        contexts: ['selection'],
        title: 'Run the code in interactive mode',
        id: 'interactive',
    });

    chrome.contextMenus.create({
        contexts: ['selection'],
        title: 'Compile the code as a .py file',
        id: 'compile',
    });
});

