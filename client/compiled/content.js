import { jsx as _jsx } from "react/jsx-runtime";
console.log("content!");
const port = chrome.runtime.connect({ name: "hackmd" });
port.postMessage("Hello from content");
port.onMessage.addListener((msg, sender) => {
    console.log(msg);
});
import { createRoot } from 'react-dom/client';
import Component from './new';
const uiContentNode = document.querySelector("div.ui-content > div:nth-child(2)");
const body = document.getElementsByTagName("body")[0];
const rootNode = document.createElement('div');
rootNode.style.cssText = `
    height: 50%;
    width: 100%;
    background-color: purple;
    position: absolute;
    zIndex: 999;
    top: 25%;
`;
uiContentNode.appendChild(rootNode);
const root = createRoot(rootNode);
root.render(_jsx(Component, {}));
