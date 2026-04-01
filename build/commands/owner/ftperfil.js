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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alterarP = alterarP;
const path_1 = require("path");
const promises_1 = require("fs/promises");
const baileys_1 = require("@whiskeysockets/baileys");
const messages_1 = require("../../exports/messages");
/**
 * Função para baixar uma imagem e salvar como `banner.png` na pasta `assets/img`.
 */
function alterarP(pico, from, messageDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        const { imageMessage } = (0, messages_1.extractMessage)(messageDetails);
        if (!imageMessage) {
            console.log("Nenhuma imagem encontrada.");
            yield pico.sendMessage(from, { text: "Envie ou marque uma imagem para substituir o banner." });
            return;
        }
        try {
            // Diretório de saída
            const outputFolder = (0, path_1.join)(__dirname, "../../../database/assets/imgs");
            yield (0, promises_1.mkdir)(outputFolder, { recursive: true });
            const filePath = (0, path_1.join)(outputFolder, "menu.png"); // Definindo o nome fixo da imagem como "banner.png"
            // Baixar imagem
            const stream = yield (0, baileys_1.downloadContentFromMessage)(imageMessage, "image");
            const chunks = [];
            try {
                for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
                    _c = stream_1_1.value;
                    _d = false;
                    const chunk = _c;
                    chunks.push(chunk);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Salvar a imagem com o nome fixo "banner.png" substituindo a imagem existente
            yield (0, promises_1.writeFile)(filePath, Buffer.concat(chunks));
            console.log(`Imagem substituída por banner.png em: ${filePath}`);
            // Confirmação ao usuário
            yield pico.sendMessage(from, { text: "Banner substituído com sucesso." });
        }
        catch (error) {
            console.error("Erro ao substituir o banner:", error);
            yield pico.sendMessage(from, { text: "Erro ao substituir o banner. Tente novamente." });
        }
    });
}
