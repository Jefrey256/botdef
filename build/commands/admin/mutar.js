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
exports.mutar = mutar;
const database_1 = require("../system/database");
function parseTime(time) {
    const num = parseInt(time);
    if (time.endsWith("s"))
        return num * 1000;
    if (time.endsWith("m"))
        return num * 60000;
    if (time.endsWith("h"))
        return num * 3600000;
    return 0;
}
function mutar(sock, from, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const mentioned = (_c = (_b = (_a = msg.message) === null || _a === void 0 ? void 0 : _a.extendedTextMessage) === null || _b === void 0 ? void 0 : _b.contextInfo) === null || _c === void 0 ? void 0 : _c.mentionedJid;
        const text = ((_e = (_d = msg.message) === null || _d === void 0 ? void 0 : _d.extendedTextMessage) === null || _e === void 0 ? void 0 : _e.text) || "";
        const args = text.split(" ");
        if (!mentioned || !args[1])
            return;
        const time = parseTime(args[1]);
        if (!time)
            return;
        const expire = Date.now() + time;
        mentioned.forEach((u) => {
            database_1.db.prepare("INSERT INTO mutes (user, groupId, expire) VALUES (?, ?, ?)").run(u, from, expire);
        });
        yield sock.sendMessage(from, {
            text: `🔇 Mutado por ${args[1]}`,
        });
    });
}
