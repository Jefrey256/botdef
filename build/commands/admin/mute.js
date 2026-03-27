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
exports.mutar = mutar;
exports.desmutar = desmutar;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const messages_1 = require("../../exports/messages");
//import "../../../assets/json/muted.json"
// Arquivo que armazena os usuários mutados
const FILE = path_1.default.join(process.cwd(), "assets", "json", "muted.json");
// Carregar dados
let muted = {};
if (fs_1.default.existsSync(FILE)) {
    try {
        muted = JSON.parse(fs_1.default.readFileSync(FILE, "utf-8"));
    }
    catch (_a) {
        muted = {};
    }
}
// Salvar dados
function saveMuted() {
    fs_1.default.writeFileSync(FILE, JSON.stringify(muted, null, 2));
}
// Converter tempo "10m", "30s", "1h"
function parseTime(time) {
    const num = parseInt(time);
    if (time.endsWith("s"))
        return num * 1000;
    if (time.endsWith("m"))
        return num * 60 * 1000;
    if (time.endsWith("h"))
        return num * 60 * 60 * 1000;
    if (!isNaN(num))
        return num * 60 * 1000; // assume minutos por padrão
    return 0;
}
// Função exportada do comando
function mutar(pico, from, messageDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const { enviarTexto } = (0, messages_1.setupMessagingServices)(pico, from, messageDetails);
        const { fullMessage, } = (0, messages_1.extractMessage)(messageDetails);
        const text = fullMessage.trim();
        // .mutar @user 10m
        if (!text.startsWith(".mutar"))
            return;
        const mentioned = (_c = (_b = (_a = messageDetails.message) === null || _a === void 0 ? void 0 : _a.extendedTextMessage) === null || _b === void 0 ? void 0 : _b.contextInfo) === null || _c === void 0 ? void 0 : _c.mentionedJid;
        const args = text.split(" ");
        if (!mentioned || !args[1]) {
            yield enviarTexto("Uso correto: .mutar @usuário 10m");
            return;
        }
        const timeMs = parseTime(args[1]);
        if (timeMs === 0) {
            yield enviarTexto("Tempo inválido! Ex: 10m, 30s, 1h");
            return;
        }
        const expire = Date.now() + timeMs;
        mentioned.forEach((user) => {
            muted[user] = expire;
        });
        saveMuted();
        yield enviarTexto(`🔇 Usuário(s) mutado(s) por ${args[1]}`);
        // Bloquear mensagens futuras do usuário mutado automaticamente
        pico.ev.on("messages.upsert", (_a) => __awaiter(this, [_a], void 0, function* ({ messages }) {
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe)
                return;
            const jid = msg.key.remoteJid;
            const msgSender = msg.key.participant || msg.key.remoteJid;
            if (muted[msgSender]) {
                if (Date.now() > muted[msgSender]) {
                    delete muted[msgSender];
                    saveMuted();
                }
                else {
                    try {
                        yield pico.sendMessage(jid, { delete: msg.key });
                    }
                    catch (_b) { }
                    return;
                }
            }
        }));
    });
}
// Também podemos criar a função desmutar
function desmutar(pico, from, messageDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const { enviarTexto } = (0, messages_1.setupMessagingServices)(pico, from, messageDetails);
        const mentioned = (_c = (_b = (_a = messageDetails.message) === null || _a === void 0 ? void 0 : _a.extendedTextMessage) === null || _b === void 0 ? void 0 : _b.contextInfo) === null || _c === void 0 ? void 0 : _c.mentionedJid;
        if (!mentioned) {
            yield enviarTexto("Uso correto: .desmutar @usuário");
            return;
        }
        mentioned.forEach((user) => delete muted[user]);
        saveMuted();
        yield enviarTexto("🔊 Usuário(s) desmutado(s)!");
    });
}
