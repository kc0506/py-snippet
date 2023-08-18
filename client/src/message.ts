
import "./message.css";

function insertMessageElement1() {
    console.log('message 1');

    const body = document.getElementsByTagName('body')[0];

    const msgNode = document.createElement('div');
    msgNode.className = 'mymessage';

    body.appendChild(msgNode);
}

insertMessageElement1();

export default insertMessageElement1;