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
exports.stickerAll = stickerAll;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_1 = __importDefault(require("fs"));
const baileys_1 = require("@whiskeysockets/baileys");
const messages_1 = require("../../exports/messages");
const PACKNAME = "Meu Bot";
const AUTHOR = "Jefrey";
function stickerAll(pico, from, messageDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        const { imageMessage, videoMessage, stickerMessage, text } = (0, messages_1.extractMessage)(messageDetails);
        const isToImg = text.includes("toimg");
        const isToGif = text.includes("togif");
        const folder = "./assets/temp";
        yield (0, promises_1.mkdir)(folder, { recursive: true });
        const base = Date.now();
        const inputBase = (0, path_1.join)(folder, `${base}`);
        const outputBase = (0, path_1.join)(folder, `${base}`);
        try {
            // =========================
            // 📥 DOWNLOAD FUNÇÃO
            // =========================
            function download(media, type, path) {
                return __awaiter(this, void 0, void 0, function* () {
                    var _a, e_1, _b, _c;
                    const stream = yield (0, baileys_1.downloadContentFromMessage)(media, type);
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
                    yield (0, promises_1.writeFile)(path, Buffer.concat(chunks));
                });
            }
            // =========================
            // 🔄 RETRY WRAPPER
            // =========================
            function runFFmpeg(command_1) {
                return __awaiter(this, arguments, void 0, function* (command, retries = 2) {
                    for (let i = 0; i <= retries; i++) {
                        try {
                            yield command();
                            return;
                        }
                        catch (err) {
                            console.log(`Tentativa ${i + 1} falhou`);
                            if (i === retries)
                                throw err;
                        }
                    }
                });
            }
            // =========================
            // 🧩 STICKER → IMG
            // =========================
            if (stickerMessage && isToImg) {
                const webp = `${inputBase}.webp`;
                const jpg = `${outputBase}.jpg`;
                yield download(stickerMessage, "sticker", webp);
                yield runFFmpeg(() => new Promise((res, rej) => {
                    (0, fluent_ffmpeg_1.default)(webp)
                        .output(jpg)
                        .on("end", () => res())
                        .on("error", rej)
                        .run();
                }));
                if (!fs_1.default.existsSync(jpg))
                    throw new Error("Falha ao converter");
                yield pico.sendMessage(from, {
                    image: fs_1.default.readFileSync(jpg),
                    caption: "🖼️ Convertido para imagem",
                });
                yield (0, promises_1.rm)(webp, { force: true });
                yield (0, promises_1.rm)(jpg, { force: true });
                return;
            }
            // =========================
            // 🧩 STICKER → GIF (FIX)
            // =========================
            if (stickerMessage && isToGif) {
                const webp = `${inputBase}.webp`;
                const mp4 = `${outputBase}.mp4`;
                yield download(stickerMessage, "sticker", webp);
                yield runFFmpeg(() => new Promise((res, rej) => {
                    (0, fluent_ffmpeg_1.default)(webp)
                        .inputOptions(["-ignore_loop", "0"])
                        .outputOptions([
                        "-movflags faststart",
                        "-pix_fmt yuv420p",
                        "-vf scale=512:512:force_original_aspect_ratio=increase",
                    ])
                        .output(mp4)
                        .on("end", () => res())
                        .on("error", rej)
                        .run();
                }));
                if (!fs_1.default.existsSync(mp4))
                    throw new Error("Falha ao converter GIF");
                yield pico.sendMessage(from, {
                    video: fs_1.default.readFileSync(mp4),
                    gifPlayback: true,
                });
                yield (0, promises_1.rm)(webp, { force: true });
                yield (0, promises_1.rm)(mp4, { force: true });
                return;
            }
            // =========================
            // 📸 IMG → STICKER
            // =========================
            if (imageMessage) {
                const input = `${inputBase}.jpg`;
                const output = `${outputBase}.webp`;
                yield download(imageMessage, "image", input);
                yield runFFmpeg(() => new Promise((res, rej) => {
                    (0, fluent_ffmpeg_1.default)(input)
                        .outputOptions([
                        "-vcodec libwebp",
                        "-vf scale=512:512:force_original_aspect_ratio=increase,crop=512:512",
                        "-loop 0",
                        "-preset picture",
                        "-qscale 50",
                    ])
                        .output(output)
                        .on("end", () => res())
                        .on("error", rej)
                        .run();
                }));
                if (!fs_1.default.existsSync(output))
                    throw new Error("Falha ao criar sticker");
                yield pico.sendMessage(from, {
                    sticker: fs_1.default.readFileSync(output),
                    packname: PACKNAME,
                    author: AUTHOR,
                });
                yield (0, promises_1.rm)(input, { force: true });
                yield (0, promises_1.rm)(output, { force: true });
                return;
            }
            // =========================
            // 🎥 VIDEO → STICKER
            // =========================
            if (videoMessage) {
                const input = `${inputBase}.mp4`;
                const output = `${outputBase}.webp`;
                yield download(videoMessage, "video", input);
                yield runFFmpeg(() => new Promise((res, rej) => {
                    (0, fluent_ffmpeg_1.default)(input)
                        .duration(8)
                        .outputOptions([
                        "-vcodec libwebp",
                        "-vf scale=512:512:force_original_aspect_ratio=increase,fps=12,crop=512:512",
                        "-loop 0",
                        "-preset picture",
                        "-qscale 50",
                    ])
                        .output(output)
                        .on("end", () => res())
                        .on("error", rej)
                        .run();
                }));
                if (!fs_1.default.existsSync(output))
                    throw new Error("Falha ao criar sticker");
                yield pico.sendMessage(from, {
                    sticker: fs_1.default.readFileSync(output),
                    packname: PACKNAME,
                    author: AUTHOR,
                });
                yield (0, promises_1.rm)(input, { force: true });
                yield (0, promises_1.rm)(output, { force: true });
                return;
            }
            yield pico.sendMessage(from, {
                text: "❌ Envie mídia válida.",
            });
        }
        catch (err) {
            console.error("ERRO FINAL:", err);
            yield pico.sendMessage(from, {
                text: "❌ Erro ao processar.",
            });
        }
    });
}
