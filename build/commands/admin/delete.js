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
exports.delMarkedMessage = delMarkedMessage;
exports.testeDel = testeDel;
const messages_1 = require("../../exports/messages");
function delMarkedMessage(pico, from, quotedKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const { enviarTexto } = (0, messages_1.setupMessagingServices)(pico, from, quotedKey);
        if (quotedKey) {
            yield pico.sendMessage(from, {
                delete: {
                    remoteJid: quotedKey.remoteJid,
                    id: quotedKey.id,
                    participant: quotedKey.participant || undefined, // Necessário para grupos
                },
            });
        }
        else {
            yield enviarTexto('Nenhuma mensagem marcada para apagar.');
            //console.error('Nenhuma mensagem marcada para apagar.');
        }
    });
}
function testeDel(pico, from, quoted) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const { enviarTexto } = (0, messages_1.setupMessagingServices)(pico, from, quoted);
        //console.log(`Dados recebidos para exclusão:`, quoted);
        // Verificar se a mensagem contém contextInfo com a mensagem citada
        if ((_c = (_b = (_a = quoted === null || quoted === void 0 ? void 0 : quoted.message) === null || _a === void 0 ? void 0 : _a.extendedTextMessage) === null || _b === void 0 ? void 0 : _b.contextInfo) === null || _c === void 0 ? void 0 : _c.quotedMessage) {
            const contextInfo = quoted.message.extendedTextMessage.contextInfo;
            const quotedKey = {
                id: contextInfo.stanzaId, // ID da mensagem marcada
                remoteJid: contextInfo.participant || from, // JID do remetente da mensagem marcada
                participant: contextInfo.participant, // Para mensagens em grupos
            };
            //console.log(`Excluindo mensagem citada: ${quotedKey.id}`);
            yield delMarkedMessage(pico, from, quotedKey);
        }
        else {
            yield enviarTexto('Nenhuma mensagem citada foi encontrada para exclusão.');
            // console.error('Nenhuma mensagem citada foi encontrada para exclusão.');
        }
    });
}
