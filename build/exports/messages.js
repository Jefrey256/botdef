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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53;
    // Verificação de que messageDetails está definido e possui uma estrutura válida
    if (!messageDetails || !messageDetails.message) {
        console.error("Detalhes da mensagem não encontrados ou estão mal formatados");
        return {
            media: undefined,
            mentions: [],
            fullMessage: "",
            from: "Desconhecido",
            fromUser: "Desconhecido",
            isCommand: false,
            commandName: "",
            args: [],
            userName: "Desconhecido",
            userRole: "membro",
            participant: null,
        };
    }
    // Captura todas as possíveis fontes de texto (mensagem simples, legenda ou texto citado)
    const textMessage = ((_a = messageDetails.message) === null || _a === void 0 ? void 0 : _a.conversation) || ""; // Mensagem simples
    const extendedTextMessage = ((_c = (_b = messageDetails.message) === null || _b === void 0 ? void 0 : _b.extendedTextMessage) === null || _c === void 0 ? void 0 : _c.text) ||
        ((_e = (_d = messageDetails.message) === null || _d === void 0 ? void 0 : _d.extendedTextMessage) === null || _e === void 0 ? void 0 : _e.text) || ""; // Texto estendido
    const imageTextMessage = ((_g = (_f = messageDetails.message) === null || _f === void 0 ? void 0 : _f.imageMessage) === null || _g === void 0 ? void 0 : _g.caption) || ""; // Legenda da imagem
    const videoTextMessage = ((_j = (_h = messageDetails.message) === null || _h === void 0 ? void 0 : _h.videoMessage) === null || _j === void 0 ? void 0 : _j.caption) || ""; // Legenda do vídeo
    const quotedMessage = ((_o = (_m = (_l = (_k = messageDetails.message) === null || _k === void 0 ? void 0 : _k.extendedTextMessage) === null || _l === void 0 ? void 0 : _l.contextInfo) === null || _m === void 0 ? void 0 : _m.quotedMessage) === null || _o === void 0 ? void 0 : _o.conversation) || ""; // Texto citado
    // Compõe o fullMessage a partir da prioridade (texto direto > legenda > citado)
    const fullMessage = textMessage || extendedTextMessage || imageTextMessage || videoTextMessage || quotedMessage;
    // Extrai menções de pessoas mencionadas na mensagem
    const mentions = ((_r = (_q = (_p = messageDetails.message) === null || _p === void 0 ? void 0 : _p.extendedTextMessage) === null || _q === void 0 ? void 0 : _q.contextInfo) === null || _r === void 0 ? void 0 : _r.mentionedJid) || [];
    // Extrai o nome do usuário ou identificador
    const fromUser = ((_t = (_s = messageDetails.key) === null || _s === void 0 ? void 0 : _s.participant) === null || _t === void 0 ? void 0 : _t.split("@")[0]) || ((_v = (_u = messageDetails.key) === null || _u === void 0 ? void 0 : _u.remoteJid) === null || _v === void 0 ? void 0 : _v.split("@")[0]);
    const userName = messageDetails.pushName || fromUser;
    //
    //
    const fromUserAdm = ((_w = messageDetails.key) === null || _w === void 0 ? void 0 : _w.participant)
        ? (_x = messageDetails.key) === null || _x === void 0 ? void 0 : _x.participant.split('@')[0] // Se for de um grupo, usa o participant
        : (_y = messageDetails.key) === null || _y === void 0 ? void 0 : _y.remoteJid.split('@')[0]; // Se for de um canal ou PV, usa o remoteJid
    //
    const groupId = ((_z = messageDetails.key) === null || _z === void 0 ? void 0 : _z.remoteJid) || null;
    //
    // Extrai o identificador do remetente
    const from = ((_0 = messageDetails.key) === null || _0 === void 0 ? void 0 : _0.remoteJid) || "Remetente desconhecido";
    // Extrai o nome de exibição do usuário
    //const userName = messageDetails?.pushName || "Usuário Desconhecido";
    const phoneNumber = (_2 = (_1 = messageDetails === null || messageDetails === void 0 ? void 0 : messageDetails.key) === null || _1 === void 0 ? void 0 : _1.participant) === null || _2 === void 0 ? void 0 : _2.replace(/:[0-9][0-9]|:[0-9]/g, "");
    // Verifica se a mensagem é um comando (com base no prefixo)
    const isCommand = fullMessage.startsWith(config_1.PREFIX);
    // Extrai o nome do comando e argumentos
    const commandName = isCommand ? fullMessage.slice(config_1.PREFIX.length).split(" ")[0] : "";
    const args = isCommand ? fullMessage.slice(config_1.PREFIX.length).split(" ").slice(1) : [];
    const key = messageDetails.key || null;
    const quotedKey = ((_5 = (_4 = (_3 = messageDetails === null || messageDetails === void 0 ? void 0 : messageDetails.message) === null || _3 === void 0 ? void 0 : _3.extendedTextMessage) === null || _4 === void 0 ? void 0 : _4.contextInfo) === null || _5 === void 0 ? void 0 : _5.quotedMessage) || null;
    //
    const quoted = ((_8 = (_7 = (_6 = messageDetails.message) === null || _6 === void 0 ? void 0 : _6.extendedTextMessage) === null || _7 === void 0 ? void 0 : _7.contextInfo) === null || _8 === void 0 ? void 0 : _8.quotedMessage) ||
        ((_11 = (_10 = (_9 = messageDetails.message) === null || _9 === void 0 ? void 0 : _9.imageMessage) === null || _10 === void 0 ? void 0 : _10.contextInfo) === null || _11 === void 0 ? void 0 : _11.quotedMessage) ||
        ((_14 = (_13 = (_12 = messageDetails.message) === null || _12 === void 0 ? void 0 : _12.videoMessage) === null || _13 === void 0 ? void 0 : _13.contextInfo) === null || _14 === void 0 ? void 0 : _14.quotedMessage) ||
        ((_17 = (_16 = (_15 = messageDetails.message) === null || _15 === void 0 ? void 0 : _15.audioMessage) === null || _16 === void 0 ? void 0 : _16.contextInfo) === null || _17 === void 0 ? void 0 : _17.quotedMessage) ||
        ((_20 = (_19 = (_18 = messageDetails.message) === null || _18 === void 0 ? void 0 : _18.documentMessage) === null || _19 === void 0 ? void 0 : _19.contextInfo) === null || _20 === void 0 ? void 0 : _20.quotedMessage);
    //
    //
    const messageContent = ((_22 = (_21 = messageDetails.message) === null || _21 === void 0 ? void 0 : _21.extendedTextMessage) === null || _22 === void 0 ? void 0 : _22.text) ||
        ((_23 = messageDetails.message) === null || _23 === void 0 ? void 0 : _23.text);
    //
    // Verificação de mídia (direta ou marcada)
    const media = ((_24 = messageDetails.message) === null || _24 === void 0 ? void 0 : _24.imageMessage) ||
        ((_25 = messageDetails.message) === null || _25 === void 0 ? void 0 : _25.videoMessage) ||
        ((_26 = messageDetails.message) === null || _26 === void 0 ? void 0 : _26.audioMessage) ||
        ((_27 = messageDetails.message) === null || _27 === void 0 ? void 0 : _27.stickerMessage) ||
        ((_28 = messageDetails.message) === null || _28 === void 0 ? void 0 : _28.documentMessage) ||
        ((_32 = (_31 = (_30 = (_29 = messageDetails.message) === null || _29 === void 0 ? void 0 : _29.extendedTextMessage) === null || _30 === void 0 ? void 0 : _30.contextInfo) === null || _31 === void 0 ? void 0 : _31.quotedMessage) === null || _32 === void 0 ? void 0 : _32.imageMessage) ||
        ((_36 = (_35 = (_34 = (_33 = messageDetails.message) === null || _33 === void 0 ? void 0 : _33.extendedTextMessage) === null || _34 === void 0 ? void 0 : _34.contextInfo) === null || _35 === void 0 ? void 0 : _35.quotedMessage) === null || _36 === void 0 ? void 0 : _36.videoMessage) ||
        ((_40 = (_39 = (_38 = (_37 = messageDetails.message) === null || _37 === void 0 ? void 0 : _37.extendedTextMessage) === null || _38 === void 0 ? void 0 : _38.contextInfo) === null || _39 === void 0 ? void 0 : _39.quotedMessage) === null || _40 === void 0 ? void 0 : _40.audioMessage) ||
        ((_44 = (_43 = (_42 = (_41 = messageDetails.message) === null || _41 === void 0 ? void 0 : _41.extendedTextMessage) === null || _42 === void 0 ? void 0 : _42.contextInfo) === null || _43 === void 0 ? void 0 : _43.quotedMessage) === null || _44 === void 0 ? void 0 : _44.stickerMessage) ||
        ((_48 = (_47 = (_46 = (_45 = messageDetails.message) === null || _45 === void 0 ? void 0 : _45.extendedTextMessage) === null || _46 === void 0 ? void 0 : _46.contextInfo) === null || _47 === void 0 ? void 0 : _47.quotedMessage) === null || _48 === void 0 ? void 0 : _48.documentMessage) ||
        ((_51 = (_50 = (_49 = messageDetails.message) === null || _49 === void 0 ? void 0 : _49.key) === null || _50 === void 0 ? void 0 : _50.contextInfo) === null || _51 === void 0 ? void 0 : _51.quotedMessage) ||
        undefined;
    return {
        messageContent,
        key,
        quoted,
        quotedKey,
        media,
        mentions,
        fullMessage,
        from,
        phoneNumber,
        fromUser,
        isCommand,
        commandName,
        args,
        textMessage,
        userName,
        groupId,
        participant: ((_52 = messageDetails.key) === null || _52 === void 0 ? void 0 : _52.participant) || ((_53 = messageDetails.key) === null || _53 === void 0 ? void 0 : _53.remoteJid),
    };
    console.log(`ola: ${phoneNumber}`);
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
                mimetype: "audio/mp4",
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
