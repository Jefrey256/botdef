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
exports.iniciarAntiLink = iniciarAntiLink;
const database_1 = require("./database");
function iniciarAntiLink(sock) {
    sock.ev.on("messages.upsert", (_a) => __awaiter(this, [_a], void 0, function* ({ messages }) {
        var _b, _c;
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe)
            return;
        const groupId = msg.key.remoteJid;
        const text = msg.message.conversation ||
            ((_b = msg.message.extendedTextMessage) === null || _b === void 0 ? void 0 : _b.text) ||
            "";
        const db = (0, database_1.load)();
        // verifica se anti-link tá ligado no grupo
        if (!((_c = db.settings[groupId]) === null || _c === void 0 ? void 0 : _c.antilink))
            return;
        // detecta link (melhorado)
        const isLink = /(https?:\/\/|www\.|chat\.whatsapp\.com)/gi.test(text);
        if (isLink) {
            try {
                yield sock.sendMessage(groupId, {
                    delete: msg.key,
                });
            }
            catch (e) {
                console.log("Erro ao deletar link:", e);
            }
        }
    }));
}
