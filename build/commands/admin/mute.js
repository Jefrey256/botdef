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
const systemMute_1 = require("../system/systemMute");
function mutar(pico, from, messageDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const user = messageDetails.key.participant;
        const args = (_b = (_a = messageDetails.message) === null || _a === void 0 ? void 0 : _a.conversation) === null || _b === void 0 ? void 0 : _b.split(" ");
        if (!args[1]) {
            yield pico.sendMessage(from, { text: "Use: !mutar 60 (segundos)" });
            return;
        }
        const tempo = parseInt(args[1]) * 1000;
        (0, systemMute_1.addMute)(user, from, tempo);
        yield pico.sendMessage(from, { text: `Usuário mutado por ${args[1]} segundos.` });
    });
}
