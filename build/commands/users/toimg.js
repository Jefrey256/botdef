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
exports.toimg = void 0;
const fs_1 = __importDefault(require("fs"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const baileys_1 = require("@whiskeysockets/baileys");
const messages_1 = require("../../exports/messages");
const toimg = (pico, from, messageDetails) => __awaiter(void 0, void 0, void 0, function* () {
    const { enviarTexto } = (0, messages_1.setupMessagingServices)(pico, from, messageDetails);
    const { quoted } = (0, messages_1.extractMessage)(messageDetails);
    // ✅ verifica se é figurinha
    if (!(quoted === null || quoted === void 0 ? void 0 : quoted.stickerMessage)) {
        return enviarTexto("❌ Responda uma figurinha!");
    }
    try {
        // 📦 montar mensagem corretamente
        const mediaMsg = {
            key: messageDetails.key,
            message: quoted
        };
        // 📥 baixar figurinha (CORRIGIDO)
        const buffer = yield (0, baileys_1.downloadMediaMessage)(mediaMsg, "buffer", {}, {
            reuploadRequest: pico.updateMediaMessage,
            logger: pico.logger
        });
        const input = `./tmp/${Date.now()}.webp`;
        const output = `./tmp/${Date.now()}.png`;
        // 💾 salvar arquivo webp
        fs_1.default.writeFileSync(input, buffer);
        // 🔁 converter webp → png
        yield new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)(input)
                .toFormat("png")
                .on("end", resolve)
                .on("error", reject)
                .save(output);
        });
        // 📤 enviar imagem
        yield pico.sendMessage(from, {
            image: fs_1.default.readFileSync(output),
            caption: "🖼️ Aqui está sua imagem!"
        }, { quoted: messageDetails });
        // 🧹 limpar arquivos
        fs_1.default.unlinkSync(input);
        fs_1.default.unlinkSync(output);
    }
    catch (err) {
        console.error("ERRO TOIMG:", err);
        enviarTexto("❌ Erro ao converter figurinha.");
    }
});
exports.toimg = toimg;
