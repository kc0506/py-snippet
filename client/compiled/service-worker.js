var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const HOSTS = Object.assign(Object.assign({}, Object.fromEntries(Array.from(Array(15), (_, i) => [`linux${i + 1}`, `linux${i + 1}.csie.ntu.edu.tw`]))), { local: 'localhost' });
const PORT = 5678;
function getUrl(host, path = '') {
    return `http://${HOSTS[host]}:${PORT}/${path}`;
}
function getActiveTabId() {
    return __awaiter(this, void 0, void 0, function* () {
        const [tab] = yield chrome.tabs.query({ active: true, lastFocusedWindow: true });
        return tab.id;
    });
}
// (async function () {
//     const tabId = await getActiveTabId();
//     chrome.scripting.executeScript({ target: { tabId }, func: () => console.log('hi') });
// })();
function getSelectionText(tabId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield chrome.scripting.executeScript({
            target: { tabId },
            func: () => { var _a; return (_a = document.getSelection()) === null || _a === void 0 ? void 0 : _a.toString(); }
        });
        return res[0].result;
    });
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield fetch(getUrl('linux1'));
        res = yield res.json();
        console.log(res);
    });
})();
const portMap = new Map();
chrome.runtime.onConnect.addListener(port => {
    var _a, _b;
    if (port.name != 'hackmd')
        return;
    const tabId = (_b = (_a = port.sender) === null || _a === void 0 ? void 0 : _a.tab) === null || _b === void 0 ? void 0 : _b.id;
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
function genericOnClick(info) {
    return __awaiter(this, void 0, void 0, function* () {
        const tabId = yield getActiveTabId();
        const content = yield getSelectionText(tabId);
        console.log(content);
        const route = info.menuItemId + '/';
        let res = yield fetch(getUrl('linux1', route), {
            method: "POST",
            body: JSON.stringify({ content }),
            headers: { "Content-Type": "application/json" },
        });
        res = yield res.json();
        console.log(res);
        chrome.scripting.executeScript({ target: { tabId }, func: insertMessageElement1, args: [] });
        // portMap.get(tabId)?.postMessage(res);
    });
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
