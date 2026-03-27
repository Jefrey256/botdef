import ffmpeg from "fluent-ffmpeg";
import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export async function createImageSticker1(pico: any, from: string, messageDetails: any) {
  const mediaMessage = messageDetails.message?.imageMessage ||
                       messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

  if (!mediaMessage) {
    await pico.sendMessage(from, { text: "Envie ou marque uma imagem para criar uma figurinha." });
    return;
  }

  try {
    // Diretório de saída
    const outputFolder = "./assets/stickers";
    await mkdir(outputFolder, { recursive: true });

    const fileExtension = "jpeg"; // Como é uma imagem, sempre será jpeg
    const inputPath = join(`outputFolder, ${Date.now()}.${fileExtension}`);
    const stickerPath = join(`outputFolder, ${Date.now()}.webp`);

    // Baixar mídia
    const stream = await downloadContentFromMessage(mediaMessage, "image");
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    await writeFile(inputPath, Buffer.concat(chunks));

    // Converter imagem para figurinha usando fluent-ffmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
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
    await pico.sendMessage(from, { sticker: { url: stickerPath } });

    // Remover os arquivos temporários
    await rm(inputPath);
    await rm(stickerPath);

    // Remover a pasta, se estiver vazia
    await rm(outputFolder, { recursive: true, force: true });

  } catch (error) {
    console.error("Erro ao criar figurinha:", error);
    await pico.sendMessage(from, { text: "Erro ao criar figurinha. Certifique-se de que a mídia está correta e tente novamente." });
  }
}