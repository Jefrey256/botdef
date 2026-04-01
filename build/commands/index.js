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
// comandos
const menu_1 = require("./users/menu");
const ping_1 = require("./users/ping");
const sticker_1 = require("./users/sticker");
const ftperfil_1 = require("./owner/ftperfil");
const dow_1 = require("./users/dow");
const delete_1 = require("./admin/delete");
const tesStk_1 = require("./users/tesStk");
const velha_1 = require("./users/velha");
const toimg_1 = require("./users/toimg");
// comandos restritos
const adminCommands = ["ft", "del", "ping", "ban", "kick", "antilink", "mutar", "desmutar"];
// 📌 PEGAR CARGO
function getUserRole(pico, groupId, user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!groupId.includes("@g.us"))
                return "membro";
            const group = yield pico.groupMetadata(groupId);
            const isAdmin = group.participants.some((p) => p.admin && p.id.split("@")[0] === user);
            if (user === config_1.OWNER_NUMBER)
                return "dono";
            if (isAdmin)
                return "admin";
            return "membro";
        }
        catch (_a) {
            return "membro";
        }
    });
}
// 🚀 HANDLER
function handleMenuCommand(pico, from, messageDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        // ❌ evita loop do bot
        if (messageDetails.key.fromMe)
            return;
        const { enviarTexto } = (0, messages_1.setupMessagingServices)(pico, from, messageDetails);
        const { fullMessage, commandName, fromUser, isCommand, text, userName, groupId } = (0, messages_1.extractMessage)(messageDetails);
        // 📌 LOG
        if (isCommand) {
            console.log(`» ${userName} → ${commandName}`);
        }
        else {
            console.log(`💬 ${userName}: ${text}`);
        }
        // 📦 COMANDOS
        const commands = {
            toimg: toimg_1.toimg,
            velha: velha_1.velha,
            help: menu_1.menu,
            menu: menu_1.menu,
            ft: ftperfil_1.alterarP,
            d: dow_1.videoDow,
            ping: ping_1.ping,
            s: sticker_1.stickerAll,
            togif: sticker_1.stickerAll,
            pi: tesStk_1.createImageSticker1,
            del: delete_1.testeDel
        };
        if (!isCommand)
            return;
        // 📌 cargo
        const role = yield getUserRole(pico, groupId, fromUser);
        // 🔒 bloqueio
        if (adminCommands.includes(commandName) && role === "membro") {
            return enviarTexto("🚫 Você não tem permissão.");
        }
        // 🚀 execução
        const cmd = commands[commandName];
        if (!cmd) {
            return enviarTexto(`❌ Comando "${commandName}" não existe.`);
        }
        try {
            yield cmd(pico, from, messageDetails);
            console.log(`✅ ${commandName} executado`);
        }
        catch (err) {
            console.error(err);
            yield enviarTexto(`❌ Erro: ${err.message}`);
        }
    });
}
