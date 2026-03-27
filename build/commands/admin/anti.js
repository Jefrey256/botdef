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
exports.antilink = antilink;
const database_1 = require("../system/database");
function antilink(sock, from, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const text = ((_a = msg.message) === null || _a === void 0 ? void 0 : _a.conversation) || "";
        if (text.includes("on")) {
            database_1.db.prepare("INSERT OR REPLACE INTO settings (groupId, antilink) VALUES (?, 1)")
                .run(from);
            yield sock.sendMessage(from, { text: "✅ Anti-link ativado" });
        }
        if (text.includes("off")) {
            database_1.db.prepare("INSERT OR REPLACE INTO settings (groupId, antilink) VALUES (?, 0)")
                .run(from);
            yield sock.sendMessage(from, { text: "❌ Anti-link desativado" });
        }
    });
}
