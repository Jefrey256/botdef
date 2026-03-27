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
exports.createImageSticker = createImageSticker;
exports.createVideoSticker = createVideoSticker;
exports.convertStickerToImage = convertStickerToImage;
exports.convertStickerToGif = convertStickerToGif;
const path_1 = require("path");
const promises_1 = require("fs/promises");
const baileys_1 = require("@whiskeysockets/baileys");
const child_process_1 = require("child_process");
const util_1 = require("util");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const execPromise = (0, util_1.promisify)(child_process_1.exec);
/**
 * Função para criar figurinha a partir de uma imagem.
 */
function createImageSticker(pico, from, messageDetails) {
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
            const inputPath = (0, path_1.join)(outputFolder, `${Date.now()}.${fileExtension}`);
            const stickerPath = (0, path_1.join)(outputFolder, `${Date.now()}.webp`);
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
            // Converter imagem para figurinha
            const command = `ffmpeg -i "${inputPath}" -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=increase,crop=512:512,setsar=1" -loop 0 -preset default -an -vsync 0 -s 512x512 -y "${stickerPath}"`;
            yield execPromise(command);
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
//aparti de video 
function createVideoSticker(pico, from, messageDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_2, _b, _c;
        var _d, _e, _f, _g, _h;
        const mediaMessage = ((_d = messageDetails.message) === null || _d === void 0 ? void 0 : _d.videoMessage) ||
            ((_h = (_g = (_f = (_e = messageDetails.message) === null || _e === void 0 ? void 0 : _e.extendedTextMessage) === null || _f === void 0 ? void 0 : _f.contextInfo) === null || _g === void 0 ? void 0 : _g.quotedMessage) === null || _h === void 0 ? void 0 : _h.videoMessage);
        if (!mediaMessage) {
            yield pico.sendMessage(from, { text: "Envie ou marque um vídeo de até 5 segundos para criar uma figurinha." });
            return;
        }
        try {
            // Diretório de saída
            const outputFolder = "./assets/stickers";
            yield (0, promises_1.mkdir)(outputFolder, { recursive: true });
            const fileExtension = "mp4"; // Como é um vídeo, sempre será mp4
            const inputPath = (0, path_1.join)(outputFolder, `${Date.now()}.${fileExtension}`);
            const stickerPath = (0, path_1.join)(outputFolder, `${Date.now()}.webp`);
            // Baixar mídia
            const stream = yield (0, baileys_1.downloadContentFromMessage)(mediaMessage, "video");
            const chunks = [];
            try {
                for (var _j = true, stream_2 = __asyncValues(stream), stream_2_1; stream_2_1 = yield stream_2.next(), _a = stream_2_1.done, !_a; _j = true) {
                    _c = stream_2_1.value;
                    _j = false;
                    const chunk = _c;
                    chunks.push(chunk);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_j && !_a && (_b = stream_2.return)) yield _b.call(stream_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            yield (0, promises_1.writeFile)(inputPath, Buffer.concat(chunks));
            // Verificar duração do vídeo
            const { stdout } = yield execPromise(`ffprobe -i "${inputPath}" -show_entries format=duration -v quiet -of csv="p=0"`);
            const duration = parseFloat(stdout.trim());
            if (duration > 6) {
                yield pico.sendMessage(from, { text: "O vídeo deve ter no máximo 5 segundos." });
                yield (0, promises_1.rm)(inputPath);
                return;
            }
            // Converter vídeo para figurinha
            const command = `ffmpeg -i "${inputPath}" -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=increase,crop=512:512,setsar=1" -loop 0 -preset default -an -vsync 0 -s 512x512 -y "${stickerPath}"`;
            yield execPromise(command);
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
//to img
function downloadSticker(stickerUrl, outputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, axios_1.default)({
            url: stickerUrl,
            method: "GET",
            responseType: "stream",
        });
        return new Promise((resolve, reject) => {
            const writer = fs_1.default.createWriteStream(outputPath);
            response.data.pipe(writer);
            writer.on("finish", resolve);
            writer.on("error", reject);
        });
    });
}
/**
 * Função para converter figurinha para imagem (JPEG).
 */
function convertStickerToImage(pico, from, stickerUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verifique se a URL da figurinha é válida
            if (!stickerUrl || typeof stickerUrl !== "string") {
                throw new Error("URL da figurinha inválida.");
            }
            // Diretório de saída
            const outputFolder = "./assets/converted";
            yield (0, promises_1.mkdir)(outputFolder, { recursive: true });
            // Caminho temporário para salvar a figurinha antes da conversão
            const tempStickerPath = (0, path_1.join)(outputFolder, `${Date.now()}.webp`);
            const outputImagePath = (0, path_1.join)(outputFolder, `${Date.now()}.jpeg`);
            // Baixar a figurinha
            yield downloadSticker(stickerUrl, tempStickerPath);
            // Converter figurinha para imagem (JPEG)
            const command = `ffmpeg -i "${tempStickerPath}" -vcodec mjpeg -q:v 2 -y "${outputImagePath}"`;
            yield execPromise(command);
            // Enviar imagem
            yield pico.sendMessage(from, { image: { url: outputImagePath }, caption: "Aqui está sua figurinha convertida em imagem!" });
            // Remover os arquivos temporários
            yield (0, promises_1.rm)(tempStickerPath);
            yield (0, promises_1.rm)(outputImagePath);
            // Remover a pasta, se estiver vazia
            yield (0, promises_1.rm)(outputFolder, { recursive: true, force: true });
        }
        catch (error) {
            console.error("Erro ao converter figurinha:", error);
            yield pico.sendMessage(from, { text: "Erro ao converter figurinha para imagem. Tente novamente." });
        }
    });
}
//togif
function convertStickerToGif(pico, from, stickerPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Diretório de saída
            const outputFolder = "./assets/converted";
            yield (0, promises_1.mkdir)(outputFolder, { recursive: true });
            const outputFileName = `${Date.now()}`;
            const outputGifPath = (0, path_1.join)(outputFolder, `${outputFileName}.gif`);
            // Converter figurinha para GIF
            const command = `ffmpeg -i "${stickerPath}" -vf "fps=10,scale=512:512:force_original_aspect_ratio=increase,crop=512:512" -y "${outputGifPath}"`;
            yield execPromise(command);
            // Enviar GIF
            yield pico.sendMessage(from, { video: { url: outputGifPath }, caption: "Aqui está sua figurinha convertida em GIF!" });
            // Remover os arquivos temporários
            yield (0, promises_1.rm)(outputGifPath);
            // Remover a pasta, se estiver vazia
            yield (0, promises_1.rm)(outputFolder, { recursive: true, force: true });
        }
        catch (error) {
            console.error("Erro ao converter figurinha:", error);
            yield pico.sendMessage(from, { text: "Erro ao converter figurinha para GIF. Tente novamente." });
        }
    });
}
