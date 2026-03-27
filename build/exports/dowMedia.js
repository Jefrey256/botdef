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
exports.getMediaContent = void 0;
const baileys_1 = require("@whiskeysockets/baileys");
//import { Buffer } from 'buffer';
const messages_1 = require("./messages");
/**
 * Faz o download de conteúdo de uma mensagem de mídia.
 * @param buffer Define se o retorno será um Buffer (true) ou Transform (false).
 * @param messageDetails Detalhes da mensagem para extração da mídia. Caso não seja fornecido, usa `media`.
 * @returns Buffer se `buffer` for `true`, ou Transform se for `false`.
 */
const getMediaContent = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (buffer = false, messageDetails // Alterado para `messageDetails`, que contém os detalhes da mensagem.
) {
    var _a, e_1, _b, _c;
    // Extração da mídia se não for fornecida diretamente
    const { media } = (0, messages_1.extractMessage)(messageDetails);
    const {} = (0, messages_1.extractMessage)(messageDetails); // Usando a função `extractMessage` para pegar a mídia da mensagem.
    // Verifique se a mídia foi extraída corretamente
    if (!media) {
        console.log("Nenhuma mídia encontrada. Detalhes da mensagem:", messageDetails); // Log para verificar os detalhes
        throw new Error("Mídia não fornecida.");
    }
    let transform;
    // Lógica para download do conteúdo baseado no tipo de mídia
    if (media instanceof baileys_1.proto.Message.ImageMessage) {
        transform = yield (0, baileys_1.downloadContentFromMessage)(media, "image");
    }
    else if (media instanceof baileys_1.proto.Message.VideoMessage) {
        transform = yield (0, baileys_1.downloadContentFromMessage)(media, "video");
    }
    else if (media instanceof baileys_1.proto.Message.AudioMessage) {
        transform = yield (0, baileys_1.downloadContentFromMessage)(media, "audio");
    }
    else if (media instanceof baileys_1.proto.Message.StickerMessage) {
        transform = yield (0, baileys_1.downloadContentFromMessage)(media, "sticker");
    }
    else if (media instanceof baileys_1.proto.Message.DocumentMessage) {
        transform = yield (0, baileys_1.downloadContentFromMessage)(media, "document");
    }
    else {
        console.log("Tipo de mídia não suportado:", media); // Log para verificar o tipo de mídia
        throw new Error("Tipo de mídia não suportado.");
    }
    // Se `buffer` for `false`, retorna o transform diretamente
    if (!buffer)
        return transform;
    // Caso contrário, converte o transform para um Buffer
    let content = Buffer.from([]);
    try {
        for (var _d = true, transform_1 = __asyncValues(transform), transform_1_1; transform_1_1 = yield transform_1.next(), _a = transform_1_1.done, !_a; _d = true) {
            _c = transform_1_1.value;
            _d = false;
            const chunk = _c;
            content = Buffer.concat([content, chunk]); // Corrigido o erro de digitação aqui
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = transform_1.return)) yield _b.call(transform_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return content;
});
exports.getMediaContent = getMediaContent;
