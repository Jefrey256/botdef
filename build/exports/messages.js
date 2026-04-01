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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMessage = void 0;
exports.setupMessagingServices = setupMessagingServices;
const config_1 = require("./config");
const fs_1 = __importDefault(require("fs"));
const extractMessage = (messageDetails) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    if (!(messageDetails === null || messageDetails === void 0 ? void 0 : messageDetails.message)) {
        console.error("Mensagem inválida");
        return null;
    }
    const msg = messageDetails.message;
    const context = (_a = msg === null || msg === void 0 ? void 0 : msg.extendedTextMessage) === null || _a === void 0 ? void 0 : _a.contextInfo;
    // 📌 TEXTOS
    const textMessage = (msg === null || msg === void 0 ? void 0 : msg.conversation) || "";
    const extendedTextMessage = ((_b = msg === null || msg === void 0 ? void 0 : msg.extendedTextMessage) === null || _b === void 0 ? void 0 : _b.text) || "";
    const imageTextMessage = ((_c = msg === null || msg === void 0 ? void 0 : msg.imageMessage) === null || _c === void 0 ? void 0 : _c.caption) || "";
    const videoTextMessage = ((_d = msg === null || msg === void 0 ? void 0 : msg.videoMessage) === null || _d === void 0 ? void 0 : _d.caption) || "";
    const quotedText = ((_e = context === null || context === void 0 ? void 0 : context.quotedMessage) === null || _e === void 0 ? void 0 : _e.conversation) || "";
    const fullMessage = textMessage ||
        extendedTextMessage ||
        imageTextMessage ||
        videoTextMessage ||
        quotedText;
    // 📌 QUOTED
    const quoted = (context === null || context === void 0 ? void 0 : context.quotedMessage) ||
        ((_g = (_f = msg === null || msg === void 0 ? void 0 : msg.imageMessage) === null || _f === void 0 ? void 0 : _f.contextInfo) === null || _g === void 0 ? void 0 : _g.quotedMessage) ||
        ((_j = (_h = msg === null || msg === void 0 ? void 0 : msg.videoMessage) === null || _h === void 0 ? void 0 : _h.contextInfo) === null || _j === void 0 ? void 0 : _j.quotedMessage) ||
        ((_l = (_k = msg === null || msg === void 0 ? void 0 : msg.audioMessage) === null || _k === void 0 ? void 0 : _k.contextInfo) === null || _l === void 0 ? void 0 : _l.quotedMessage);
    // 📌 MÍDIA
    const imageMessage = (msg === null || msg === void 0 ? void 0 : msg.imageMessage) || (quoted === null || quoted === void 0 ? void 0 : quoted.imageMessage);
    const videoMessage = (msg === null || msg === void 0 ? void 0 : msg.videoMessage) || (quoted === null || quoted === void 0 ? void 0 : quoted.videoMessage);
    const stickerMessage = (msg === null || msg === void 0 ? void 0 : msg.stickerMessage) || (quoted === null || quoted === void 0 ? void 0 : quoted.stickerMessage);
    const audioMessage = (msg === null || msg === void 0 ? void 0 : msg.audioMessage) || (quoted === null || quoted === void 0 ? void 0 : quoted.audioMessage);
    const documentMessage = (msg === null || msg === void 0 ? void 0 : msg.documentMessage) || (quoted === null || quoted === void 0 ? void 0 : quoted.documentMessage);
    const media = imageMessage ||
        videoMessage ||
        stickerMessage ||
        audioMessage ||
        documentMessage ||
        undefined;
    // 📌 STICKER
    const isSticker = !!stickerMessage;
    const isAnimated = (stickerMessage === null || stickerMessage === void 0 ? void 0 : stickerMessage.isAnimated) || false;
    // 📌 USUÁRIO
    const from = ((_m = messageDetails.key) === null || _m === void 0 ? void 0 : _m.remoteJid) || "";
    const fromUser = ((_p = (_o = messageDetails.key) === null || _o === void 0 ? void 0 : _o.participant) === null || _p === void 0 ? void 0 : _p.split("@")[0]) ||
        from.split("@")[0];
    const userName = messageDetails.pushName || fromUser;
    const groupId = from;
    const phoneNumber = ((_r = (_q = messageDetails.key) === null || _q === void 0 ? void 0 : _q.participant) === null || _r === void 0 ? void 0 : _r.replace(/:[0-9]+/g, "")) || "";
    // 📌 COMANDOS
    const isCommand = fullMessage.startsWith(config_1.PREFIX);
    const commandName = isCommand
        ? fullMessage.slice(config_1.PREFIX.length).split(" ")[0]
        : "";
    const args = isCommand
        ? fullMessage.slice(config_1.PREFIX.length).split(" ").slice(1)
        : [];
    // 📌 MENÇÕES
    const mentions = (context === null || context === void 0 ? void 0 : context.mentionedJid) || [];
    const type = imageMessage ? "image" :
        videoMessage ? "video" :
            stickerMessage ? "sticker" :
                audioMessage ? "audio" :
                    "text";
    return {
        type,
        fullMessage,
        text: fullMessage,
        isCommand,
        commandName,
        args,
        media,
        imageMessage,
        videoMessage,
        stickerMessage,
        audioMessage,
        documentMessage,
        isSticker,
        isAnimated,
        quoted,
        mentions,
        from,
        fromUser,
        userName,
        groupId,
        phoneNumber,
        participant: ((_s = messageDetails.key) === null || _s === void 0 ? void 0 : _s.participant) || from,
    };
};
exports.extractMessage = extractMessage;
function setupMessagingServices(pico, from, messageDetails) {
    const enviarTexto = (texto) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield pico.sendMessage(from, { text: texto }, { quoted: messageDetails });
        }
        catch (error) {
            console.error('Erro ao enviar texto:', error);
        }
    });
    const enviarAudioGravacao = (arquivo) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield pico.sendMessage(from, {
                audio: fs_1.default.readFileSync(arquivo),
                mimetype: "audio/mpeg",
                ptt: true,
            }, { quoted: messageDetails });
        }
        catch (error) {
            console.error('Erro ao enviar áudio:', error);
        }
    });
    const enviarImagem = (arquivo, text) => __awaiter(this, void 0, void 0, function* () {
        try {
            // Verifica se 'arquivo' é uma URL (string que começa com 'http')
            if (typeof arquivo === 'string' && arquivo.startsWith('http')) {
                // Envia a imagem diretamente pela URL
                yield pico.sendMessage(from, {
                    image: { url: arquivo }, // Envia a imagem pela URL
                    caption: text
                }, { quoted: messageDetails });
            }
            else if (Buffer.isBuffer(arquivo)) {
                // Se 'arquivo' for um Buffer (dados binários da imagem)
                yield pico.sendMessage(from, {
                    image: arquivo, // Envia a imagem a partir do Buffer
                    caption: text
                }, { quoted: messageDetails });
            }
            else if (typeof arquivo === 'string') {
                // Se 'arquivo' for um caminho local, lê o arquivo diretamente
                if (fs_1.default.existsSync(arquivo)) {
                    // Lê o arquivo de imagem como Buffer
                    const imageBuffer = fs_1.default.readFileSync(arquivo);
                    // Envia a imagem a partir do Buffer
                    yield pico.sendMessage(from, {
                        image: imageBuffer, // Envia a imagem a partir do Buffer
                        caption: text
                    }, { quoted: messageDetails });
                }
                else {
                    console.error('Arquivo não encontrado:', arquivo);
                }
            }
            else {
                console.error('O arquivo ou URL não é válido:', arquivo);
            }
        }
        catch (error) {
            console.error('Erro ao enviar imagem:', error);
        }
    });
    const enviarVideo = (arquivo, text) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield pico.sendMessage(from, {
                video: fs_1.default.readFileSync(arquivo),
                caption: text,
                mimetype: "video/mp4"
            }, { quoted: messageDetails });
        }
        catch (error) {
            console.error('Erro ao enviar vídeo:', error);
        }
    });
    const enviarDocumento = (arquivo, text) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield pico.sendMessage(from, {
                document: fs_1.default.readFileSync(arquivo),
                caption: text
            }, { quoted: messageDetails });
        }
        catch (error) {
            console.error('Erro ao enviar documento:', error);
        }
    });
    const enviarSticker = (arquivo) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield pico.sendMessage(from, {
                sticker: fs_1.default.readFileSync(arquivo)
            }, { quoted: messageDetails });
        }
        catch (error) {
            console.error('Erro ao enviar sticker:', error);
        }
    });
    const enviarLocalizacao = (latitude, longitude, text) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield pico.sendMessage(from, {
                location: { latitude, longitude, caption: text }
            }, { quoted: messageDetails });
        }
        catch (error) {
            console.error('Erro ao enviar localização:', error);
        }
    });
    const enviarContato = (numero, nome) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield pico.sendMessage(from, {
                contact: {
                    phone: numero,
                    name: { formattedName: nome }
                }
            }, { quoted: messageDetails });
        }
        catch (error) {
            console.error('Erro ao enviar contato:', error);
        }
    });
    //console.log('from:', from);
    //console.log('messageDetails:', messageDetails);
    return {
        enviarTexto,
        enviarAudioGravacao,
        enviarImagem,
        enviarVideo,
        enviarDocumento,
        enviarSticker,
        enviarLocalizacao,
        enviarContato
    };
}
