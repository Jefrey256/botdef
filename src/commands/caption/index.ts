import { PREFIX, BOT_NAME, } from "../../config";
import { setupMessagingServices } from "../../exports/messages";

export  function menuCaption(messageDetails) {
  const userName = messageDetails.participant;
  console.log(userName);

  return `╭─═════༻-༺════─╮
[ ✧ ]  Me: ${BOT_NAME}
[ ✧ ]  Prefix: (${PREFIX})
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
