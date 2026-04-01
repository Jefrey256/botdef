import ffmpeg from "fluent-ffmpeg";
import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import fs from "fs";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { extractMessage } from "../../exports/messages";
const PACKNAME = "Meu Bot";
const AUTHOR = "Jefrey";

export async function stickerAll(pico: any, from: string, messageDetails: any) {
  const {imageMessage, videoMessage, stickerMessage, text} = extractMessage(messageDetails);

  

  

  

  const isToImg = text.includes("toimg");
  const isToGif = text.includes("togif");

  const folder = "./assets/temp";
  await mkdir(folder, { recursive: true });

  const base = Date.now();
  const inputBase = join(folder, `${base}`);
  const outputBase = join(folder, `${base}`);

  try {
    // =========================
    // 📥 DOWNLOAD FUNÇÃO
    // =========================
    async function download(media: any, type: any, path: string) {
      const stream = await downloadContentFromMessage(media, type);
      const chunks: Buffer[] = [];
      for await (const chunk of stream) chunks.push(chunk);
      await writeFile(path, Buffer.concat(chunks));
    }

    // =========================
    // 🔄 RETRY WRAPPER
    // =========================
    async function runFFmpeg(command: () => Promise<void>, retries = 2) {
      for (let i = 0; i <= retries; i++) {
        try {
          await command();
          return;
        } catch (err) {
          console.log(`Tentativa ${i + 1} falhou`);
          if (i === retries) throw err;
        }
      }
    }

    // =========================
    // 🧩 STICKER → IMG
    // =========================
    if (stickerMessage && isToImg) {
      const webp = `${inputBase}.webp`;
      const jpg = `${outputBase}.jpg`;

      await download(stickerMessage, "sticker", webp);

      await runFFmpeg(() =>
        new Promise((res, rej) => {
          ffmpeg(webp)
            .output(jpg)
            .on("end", () => res())
            .on("error", rej)
            .run();
        })
      );

      if (!fs.existsSync(jpg)) throw new Error("Falha ao converter");

      await pico.sendMessage(from, {
        image: fs.readFileSync(jpg),
        caption: "🖼️ Convertido para imagem",
      });

      await rm(webp, { force: true });
      await rm(jpg, { force: true });
      return;
    }

    // =========================
    // 🧩 STICKER → GIF (FIX)
    // =========================
    if (stickerMessage && isToGif) {
      const webp = `${inputBase}.webp`;
      const mp4 = `${outputBase}.mp4`;

      await download(stickerMessage, "sticker", webp);

      await runFFmpeg(() =>
        new Promise((res, rej) => {
          ffmpeg(webp)
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
        })
      );

      if (!fs.existsSync(mp4)) throw new Error("Falha ao converter GIF");

      await pico.sendMessage(from, {
        video: fs.readFileSync(mp4),
        gifPlayback: true,
      });

      await rm(webp, { force: true });
      await rm(mp4, { force: true });
      return;
    }

    // =========================
    // 📸 IMG → STICKER
    // =========================
    if (imageMessage) {
      const input = `${inputBase}.jpg`;
      const output = `${outputBase}.webp`;

      await download(imageMessage, "image", input);

      await runFFmpeg(() =>
        new Promise((res, rej) => {
          ffmpeg(input)
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
        })
      );

      if (!fs.existsSync(output)) throw new Error("Falha ao criar sticker");

      await pico.sendMessage(from, {
        sticker: fs.readFileSync(output),
        packname: PACKNAME,
        author: AUTHOR,
      });

      await rm(input, { force: true });
      await rm(output, { force: true });
      return;
    }

    // =========================
    // 🎥 VIDEO → STICKER
    // =========================
    if (videoMessage) {
      const input = `${inputBase}.mp4`;
      const output = `${outputBase}.webp`;

      await download(videoMessage, "video", input);

      await runFFmpeg(() =>
        new Promise((res, rej) => {
          ffmpeg(input)
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
        })
      );

      if (!fs.existsSync(output)) throw new Error("Falha ao criar sticker");

      await pico.sendMessage(from, {
        sticker: fs.readFileSync(output),
        packname: PACKNAME,
        author: AUTHOR,
      });

      await rm(input, { force: true });
      await rm(output, { force: true });
      return;
    }

    await pico.sendMessage(from, {
      text: "❌ Envie mídia válida.",
    });

  } catch (err: any) {
    console.error("ERRO FINAL:", err);
    await pico.sendMessage(from, {
      text: "❌ Erro ao processar.",
    });
  }
}