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
exports.iniciarSistemaMute = iniciarSistemaMute;
const database_1 = require("./database");
function iniciarSistemaMute(sock) {
    sock.ev.on("messages.upsert", (_a) => __awaiter(this, [_a], void 0, function* ({ messages }) {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe)
            return;
        const groupId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const mute = database_1.db.prepare("SELECT * FROM mutes WHERE user = ? AND groupId = ?").get(sender, groupId);
        if (!mute)
            return;
        if (Date.now() > mute.expire) {
            database_1.db.prepare("DELETE FROM mutes WHERE user = ? AND groupId = ?")
                .run(sender, groupId);
            return;
        }
        try {
            yield sock.sendMessage(groupId, { delete: msg.key });
        }
        catch (_b) { }
    }));
}
