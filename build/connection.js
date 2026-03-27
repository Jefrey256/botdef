"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.reng = reng;
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const pino_1 = require("pino");
const path_1 = __importDefault(require("path"));
const messages_1 = require("./exports/messages");
const commands_1 = require("./commands");
const exports_1 = require("./exports");
function reng() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const logger = (0, pino_1.pino)({ level: "silent" });
        const { version } = yield (0, baileys_1.fetchLatestBaileysVersion)();
        const { state, saveCreds } = yield (0, baileys_1.useMultiFileAuthState)(path_1.default.resolve(__dirname, "../database/qr-code"));
        const riko = (0, baileys_1.default)({
            version,
            logger,
            printQRInTerminal: false, // Desativamos para exibir manualmente
            auth: state,
            defaultQueryTimeoutMs: undefined,
            markOnlineOnConnect: true,
            syncFullHistory: true
        });
        riko.ev.on("connection.update", (update) => {
            var _a;
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const shoudlReconnect = ((_a = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.statusCode) !== baileys_1.DisconnectReason.loggedOut;
                console.log("conexao fechada devido ao erro:", lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error, "tentando reconectar:", shoudlReconnect);
                if (shoudlReconnect)
                    reng();
            }
            else if (connection === "open") {
                console.log("conexao aberta com sucesso");
            }
        });
        if (!((_a = state.creds) === null || _a === void 0 ? void 0 : _a.registered)) {
            let phoneNumber = yield (0, exports_1.question)("Digite o número de telefone (com código do país, ex: +5511999999999): ");
            phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
            if (!phoneNumber) {
                throw new Error("numero de telefone inválido");
            }
            const code = yield riko.requestPairingCode(phoneNumber);
            console.log(`codigo de pareamento enviado para ${phoneNumber}: ${code}`);
        }
        riko.ev.on("creds.update", saveCreds);
        //
        riko.ev.on("messages.upsert", (pi) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            try {
                const message = pi.messages && pi.messages[0];
                if (!message || !message.message)
                    return; // Ignora mensagens inválidas
                const tfrom = message.key.remoteJid;
                const fromUser = ((_b = (_a = message.key) === null || _a === void 0 ? void 0 : _a.participant) === null || _b === void 0 ? void 0 : _b.split("@")[0]) || ((_d = (_c = message.key) === null || _c === void 0 ? void 0 : _c.remoteJid) === null || _d === void 0 ? void 0 : _d.split("@")[0]);
                const userName = message.pushName || fromUser; // Nome do usuário ou número
                const messageText = ((_e = message.message) === null || _e === void 0 ? void 0 : _e.conversation) ||
                    ((_g = (_f = message.message) === null || _f === void 0 ? void 0 : _f.extendedTextMessage) === null || _g === void 0 ? void 0 : _g.text) || '';
                // Ignora mensagens enviadas pelo próprio bot
                //if (message.key.fromMe) return;
                // Extrai mensagem completa e verifica se é um comando
                const { fullMessage, isCommand } = (0, messages_1.extractMessage)(message);
                console.log(`Mensagem recebida de ${userName}: ${fullMessage}`);
                const messageType = (message === null || message === void 0 ? void 0 : message.message) ? Object.keys(message.message)[0] : null;
                if (messageType)
                    console.log(`Tipo de mensagem: ${messageType}`);
                const quoted = (_k = (_j = (_h = message.message) === null || _h === void 0 ? void 0 : _h.extendedTextMessage) === null || _j === void 0 ? void 0 : _j.contextInfo) === null || _k === void 0 ? void 0 : _k.quotedMessage;
                if (quoted)
                    console.log("Mensagem citada:", quoted);
                // Tratamento de comandos
                if (isCommand) {
                    console.log("Processando comando...");
                    yield (0, commands_1.handleMenuCommand)(riko, tfrom, message);
                    return;
                }
                // Resposta automática para mensagens "oi" ou "ola"
                if (messageText) {
                    const toLowerCase = messageText.toLowerCase();
                    if (toLowerCase.includes("oi") || toLowerCase.includes("ola")) {
                        console.log("Respondendo a saudação...");
                        //await pico.sendMessage(tfrom, { text: "Olá, tudo bem?" });
                    }
                }
            }
            catch (error) {
                console.error("Erro ao processar a mensagem:", error);
            }
        }));
        return riko;
    });
}
