"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMenuCommand = handleMenuCommand;
const messages_1 = require("../exports/messages");
const config_1 = require("../config");
// Comandos
const menu_1 = require("./users/menu");
const ping_1 = require("./users/ping");
const sticker_1 = require("./users/sticker");
const ftperfil_1 = require("./owner/ftperfil");
const dow_1 = require("./users/dow");
const delete_1 = require("./admin/delete");
const tesStk_1 = require("./users/tesStk");
// Fim comandos
// Lista de comandos restritos para administradores
const adminCommands = ['ft', "del", 'ping']; // Comandos apenas para 
//
//
function getUserRole(pico, groupId, fromUserAdm) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Obtém os participantes do grupo
            const groupMetadata = yield pico.groupMetadata(groupId);
            const admins = groupMetadata.participants.filter((participant) => participant.admin);
            const isAdmin = admins.some((admin) => admin.id.split('@')[0] === fromUserAdm);
            // Verifica se o número do usuário é o do dono
            if (fromUserAdm === config_1.OWNER_NUMBER) {
                return 'dono'; // Usuário é o dono
            }
            else if (isAdmin) {
                return 'admin'; // Usuário é um administrador
            }
            else {
                return 'membro'; // Usuário é um membro
            }
        }
        catch (error) {
            console.error("Erro ao verificar o cargo:", error);
            return 'membro'; // Caso ocorra erro, considera como membro
        }
    });
}
function handleMenuCommand(pico, from, messageDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        const { enviarTexto } = (0, messages_1.setupMessagingServices)(pico, from, messageDetails);
        const { fullMessage, commandName, fromUser, media, isCommand, messageContent, textMessage, from: messageFrom, userName } = (0, messages_1.extractMessage)(messageDetails);
        // Verifica se a mensagem foi enviada pelo próprio bot para evitar loops
        if (messageFrom === pico) {
            console.log("Mensagem do bot");
            return;
        }
        if (isCommand) {
            console.log(` » ${userName}҂${commandName}`);
        }
        else if (isCommand === pico) {
            return;
        }
        else {
            console.log(`=> ${userName} / ${textMessage} ${messageContent}`);
        }
        // Mapeamento de comandos disponíveis
        const commands = {
            help: menu_1.menu,
            menu: menu_1.menu,
            ft: ftperfil_1.alterarP, // Apenas admin pode usar
            d: dow_1.videoDow,
            ping: ping_1.ping, // Apenas admin pode usar
            // Comandos de figurinha
            toimg: sticker_1.convertStickerToImage,
            tomp4: sticker_1.convertStickerToGif,
            s: sticker_1.createImageSticker,
            sticker: sticker_1.createImageSticker,
            stk: sticker_1.createVideoSticker,
            f: sticker_1.createVideoSticker,
            pi: tesStk_1.createImageSticker1,
            // Fim
            del: delete_1.testeDel
        };
        // Verifica se é um comando
        if (isCommand) {
            // Aqui usamos o fromUserAdm extraído
            const role = yield getUserRole(pico, from, fromUser);
            //console.log(`Comando: ${commandName} - Usuário: ${fromUser} - Cargo: ${role}`);
            // Se o comando for restrito para admin e o usuário não for admin nem dono, exibe mensagem de erro
            if (adminCommands.includes(commandName) && role !== 'admin' && role !== 'dono') {
                yield enviarTexto("Você não tem permissão para executar este comando.");
                return;
            }
            // Se o comando for público ou o usuário for admin/dono, executa o comando
            if (commands[commandName]) {
                try {
                    // Executa o comando correspondente
                    yield commands[commandName](pico, from, messageDetails);
                    console.log(`Comando ${commandName} executado com sucesso.`);
                }
                catch (error) {
                    // Envia mensagem de erro caso o comando falhe
                    yield enviarTexto(`Erro ao executar o comando ${commandName}: ${error.message}`);
                    console.log(`Erro ao executar o comando ${commandName}: ${error.message}`);
                }
            }
            else {
                // Envia mensagem caso o comando não seja encontrado
                yield enviarTexto(`Comando ${commandName} não encontrado.`);
            }
        }
    });
}
