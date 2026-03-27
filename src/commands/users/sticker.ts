import { join } from "path";
import { writeFile, mkdir, rm } from "fs/promises";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { exec } from "child_process";
import { promisify } from "util";
import axios from "axios";
import fs from "fs";

const execPromise = promisify(exec);

/**
 * Função para criar figurinha a partir de uma imagem.
 */
export async function createImageSticker(pico: any, from: string, messageDetails: any) {
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

    const fileExtension = "jpeg";  // Como é uma imagem, sempre será jpeg
    const inputPath = join(outputFolder, `${Date.now()}.${fileExtension}`);
    const stickerPath = join(outputFolder, `${Date.now()}.webp`);

    // Baixar mídia
    const stream = await downloadContentFromMessage(mediaMessage, "image");
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    await writeFile(inputPath, Buffer.concat(chunks));

    // Converter imagem para figurinha
    const command = `ffmpeg -i "${inputPath}" -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=increase,crop=512:512,setsar=1" -loop 0 -preset default -an -vsync 0 -s 512x512 -y "${stickerPath}"`;
    await execPromise(command);

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


//aparti de video 

export async function createVideoSticker(pico: any, from: string, messageDetails: any) {
  const mediaMessage = messageDetails.message?.videoMessage ||
                       messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;

  if (!mediaMessage) {
    await pico.sendMessage(from, { text: "Envie ou marque um vídeo de até 5 segundos para criar uma figurinha." });
    return;
  }

  try {
    // Diretório de saída
    const outputFolder = "./assets/stickers";
    await mkdir(outputFolder, { recursive: true });

    const fileExtension = "mp4";  // Como é um vídeo, sempre será mp4
    const inputPath = join(outputFolder, `${Date.now()}.${fileExtension}`);
    const stickerPath = join(outputFolder, `${Date.now()}.webp`);

    // Baixar mídia
    const stream = await downloadContentFromMessage(mediaMessage, "video");
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    await writeFile(inputPath, Buffer.concat(chunks));

    // Verificar duração do vídeo
    const { stdout } = await execPromise(`ffprobe -i "${inputPath}" -show_entries format=duration -v quiet -of csv="p=0"`);
    const duration = parseFloat(stdout.trim());

    if (duration > 6) {
      await pico.sendMessage(from, { text: "O vídeo deve ter no máximo 5 segundos." });
      await rm(inputPath);
      return;
    }

    // Converter vídeo para figurinha
    const command = `ffmpeg -i "${inputPath}" -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=increase,crop=512:512,setsar=1" -loop 0 -preset default -an -vsync 0 -s 512x512 -y "${stickerPath}"`;
    await execPromise(command);

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

//to img

async function downloadSticker(stickerUrl: string, outputPath: string) {
  const response = await axios({
    url: stickerUrl,
    method: "GET",
    responseType: "stream",
  });

  return new Promise<void>((resolve, reject) => {
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

/**
 * Função para converter figurinha para imagem (JPEG).
 */
export async function convertStickerToImage(pico: any, from: string, stickerUrl: string) {
  try {
    // Verifique se a URL da figurinha é válida
    if (!stickerUrl || typeof stickerUrl !== "string") {
      throw new Error("URL da figurinha inválida.");
    }

    // Diretório de saída
    const outputFolder = "./assets/converted";
    await mkdir(outputFolder, { recursive: true });

    // Caminho temporário para salvar a figurinha antes da conversão
    const tempStickerPath = join(outputFolder, `${Date.now()}.webp`);
    const outputImagePath = join(outputFolder, `${Date.now()}.jpeg`);

    // Baixar a figurinha
    await downloadSticker(stickerUrl, tempStickerPath);

    // Converter figurinha para imagem (JPEG)
    const command = `ffmpeg -i "${tempStickerPath}" -vcodec mjpeg -q:v 2 -y "${outputImagePath}"`;
    await execPromise(command);

    // Enviar imagem
    await pico.sendMessage(from, { image: { url: outputImagePath }, caption: "Aqui está sua figurinha convertida em imagem!" });

    // Remover os arquivos temporários
    await rm(tempStickerPath);
    await rm(outputImagePath);

    // Remover a pasta, se estiver vazia
    await rm(outputFolder, { recursive: true, force: true });

  } catch (error) {
    console.error("Erro ao converter figurinha:", error);
    await pico.sendMessage(from, { text: "Erro ao converter figurinha para imagem. Tente novamente." });
  }
}



//togif

export async function convertStickerToGif(pico: any, from: string, stickerPath: string) {
  try {
    // Diretório de saída
    const outputFolder = "./assets/converted";
    await mkdir(outputFolder, { recursive: true });

    const outputFileName = `${Date.now()}`;
    const outputGifPath = join(outputFolder, `${outputFileName}.gif`);

    // Converter figurinha para GIF
    const command = `ffmpeg -i "${stickerPath}" -vf "fps=10,scale=512:512:force_original_aspect_ratio=increase,crop=512:512" -y "${outputGifPath}"`;
    await execPromise(command);

    // Enviar GIF
    await pico.sendMessage(from, { video: { url: outputGifPath }, caption: "Aqui está sua figurinha convertida em GIF!" });

    // Remover os arquivos temporários
    await rm(outputGifPath);

    // Remover a pasta, se estiver vazia
    await rm(outputFolder, { recursive: true, force: true });

  } catch (error) {
    console.error("Erro ao converter figurinha:", error);
    await pico.sendMessage(from, { text: "Erro ao converter figurinha para GIF. Tente novamente." });
  }
}