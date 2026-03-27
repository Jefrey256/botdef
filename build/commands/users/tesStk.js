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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImageSticker1 = createImageSticker1;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const promises_1 = require("fs/promises");
const path_1 = require("path");
const baileys_1 = require("@whiskeysockets/baileys");
function createImageSticker1(pico, from, messageDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        var _d, _e, _f, _g, _h;
        const mediaMessage = ((_d = messageDetails.message) === null || _d === void 0 ? void 0 : _d.imageMessage) ||
            ((_h = (_g = (_f = (_e = messageDetails.message) === null || _e === void 0 ? void 0 : _e.extendedTextMessage) === null || _f === void 0 ? void 0 : _f.contextInfo) === null || _g === void 0 ? void 0 : _g.quotedMessage) === null || _h === void 0 ? void 0 : _h.imageMessage);
        if (!mediaMessage) {
            yield pico.sendMessage(from, { text: "Envie ou marque uma imagem para criar uma figurinha." });
            return;
        }
        try {
            // Diretório de saída
            const outputFolder = "./assets/stickers";
            yield (0, promises_1.mkdir)(outputFolder, { recursive: true });
            const fileExtension = "jpeg"; // Como é uma imagem, sempre será jpeg
            const inputPath = (0, path_1.join)(`outputFolder, ${Date.now()}.${fileExtension}`);
            const stickerPath = (0, path_1.join)(`outputFolder, ${Date.now()}.webp`);
            // Baixar mídia
            const stream = yield (0, baileys_1.downloadContentFromMessage)(mediaMessage, "image");
            const chunks = [];
            try {
                for (var _j = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a; _j = true) {
                    _c = stream_1_1.value;
                    _j = false;
                    const chunk = _c;
                    chunks.push(chunk);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_j && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            yield (0, promises_1.writeFile)(inputPath, Buffer.concat(chunks));
            // Converter imagem para figurinha usando fluent-ffmpeg
            yield new Promise((resolve, reject) => {
                (0, fluent_ffmpeg_1.default)(inputPath)
                    .outputOptions([
                    "-vcodec libwebp",
                    "-vf scale=512:512:force_original_aspect_ratio=increase,crop=512:512,setsar=1",
                    "-loop 0",
                    "-preset default",
                    "-an",
                    "-vsync 0",
                    "-s 512x512",
                ])
                    .output(stickerPath)
                    .on("end", () => resolve())
                    .on("error", (err) => reject(err))
                    .run();
            });
            // Enviar figurinha
            yield pico.sendMessage(from, { sticker: { url: stickerPath } });
            // Remover os arquivos temporários
            yield (0, promises_1.rm)(inputPath);
            yield (0, promises_1.rm)(stickerPath);
            // Remover a pasta, se estiver vazia
            yield (0, promises_1.rm)(outputFolder, { recursive: true, force: true });
        }
        catch (error) {
            console.error("Erro ao criar figurinha:", error);
            yield pico.sendMessage(from, { text: "Erro ao criar figurinha. Certifique-se de que a mídia está correta e tente novamente." });
        }
    });
}
