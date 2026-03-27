"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuCaption = menuCaption;
const config_1 = require("../../config");
function menuCaption(messageDetails) {
    const userName = messageDetails.participant;
    console.log(userName);
    return `╭─═════༻-༺════─╮
[ ✧ ]  Me: ${config_1.BOT_NAME}
[ ✧ ]  Prefix: (${config_1.PREFIX})
[ ✧ ]  Status: Online
[ ✧ ]  Usuário: ${userName}
         
[ ✧ ]  Comandos: s, f, sticker
[ ✧ ]  Comandos: toimg
[ ✧ ]  Comandos: ping
[ ✧ ]  Comandos: menu
[ ✧ ]  Comandos: del
[ ✧ ]  Comandos: help
╰─═════༻-༺════─╯`;
}
