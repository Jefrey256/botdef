import makeWASocket, { downloadMediaMessage } from "@whiskeysockets/baileys"
import { PREFIX } from "./config";
import fs from "fs";
import { writeFile } from "fs/promises";
import pino, { Logger } from "pino";
import { logger } from ".";
import { getMediaContent } from "./dowMedia";
import path from "path";
import { proto } from "@whiskeysockets/baileys";
export const extractMessage = (messageDetails: any) => {
  if (!messageDetails?.message) {
    console.error("Mensagem inválida");
    return null;
  }

  const msg = messageDetails.message;
  const context = msg?.extendedTextMessage?.contextInfo;

  // 📌 TEXTOS
  const textMessage = msg?.conversation || "";
  const extendedTextMessage = msg?.extendedTextMessage?.text || "";
  const imageTextMessage = msg?.imageMessage?.caption || "";
  const videoTextMessage = msg?.videoMessage?.caption || "";
  const quotedText = context?.quotedMessage?.conversation || "";

  const fullMessage =
    textMessage ||
    extendedTextMessage ||
    imageTextMessage ||
    videoTextMessage ||
    quotedText;

  // 📌 QUOTED
  const quoted =
    context?.quotedMessage ||
    msg?.imageMessage?.contextInfo?.quotedMessage ||
    msg?.videoMessage?.contextInfo?.quotedMessage ||
    msg?.audioMessage?.contextInfo?.quotedMessage;

  // 📌 MÍDIA
  const imageMessage =
    msg?.imageMessage || quoted?.imageMessage;

  const videoMessage =
    msg?.videoMessage || quoted?.videoMessage;

  const stickerMessage =
    msg?.stickerMessage || quoted?.stickerMessage;

  const audioMessage =
    msg?.audioMessage || quoted?.audioMessage;

  const documentMessage =
    msg?.documentMessage || quoted?.documentMessage;

  const media =
    imageMessage ||
    videoMessage ||
    stickerMessage ||
    audioMessage ||
    documentMessage ||
    undefined;

  // 📌 STICKER
  const isSticker = !!stickerMessage;
  const isAnimated = stickerMessage?.isAnimated || false;

  // 📌 USUÁRIO
  const from = messageDetails.key?.remoteJid || "";
  const fromUser =
    messageDetails.key?.participant?.split("@")[0] ||
    from.split("@")[0];

  const userName = messageDetails.pushName || fromUser;
  const groupId = from;

  const phoneNumber =
    messageDetails.key?.participant?.replace(/:[0-9]+/g, "") || "";

  // 📌 COMANDOS
  const isCommand = fullMessage.startsWith(PREFIX);
  const commandName = isCommand
    ? fullMessage.slice(PREFIX.length).split(" ")[0]
    : "";

  const args = isCommand
    ? fullMessage.slice(PREFIX.length).split(" ").slice(1)
    : [];

  // 📌 MENÇÕES
  const mentions = context?.mentionedJid || [];
  const type =
  imageMessage ? "image" :
  videoMessage ? "video" :
  stickerMessage ? "sticker" :
  audioMessage ? "audio" :
  "text";

  const messageContent =
  messageDetails.message?.extendedTextMessage?.text ||
  messageDetails.message?.conversation ||
  "";

  return {
    messageContent,
    textMessage,
    type,
    fullMessage,
    text: fullMessage,

    isCommand,
    commandName,
    args,

    media,
    imageMessage,
    videoMessage,
    stickerMessage,
    audioMessage,
    documentMessage,

    isSticker,
    isAnimated,

    quoted,

    mentions,

    from,
    fromUser,
    userName,
    groupId,
    phoneNumber,

    participant: messageDetails.key?.participant || from,
  };
};

  
export function setupMessagingServices(pico, from, messageDetails) {
  
    const enviarTexto = async (texto) => {
      try {
        await pico.sendMessage(from, { text: texto }, { quoted: messageDetails });
      } catch (error) {
        console.error('Erro ao enviar texto:', error);
      }
    };
  
    const enviarAudioGravacao = async (arquivo) => {
      try {
        await pico.sendMessage(from, {
          audio: fs.readFileSync(arquivo),
          mimetype: "audio/mpeg",
          ptt: true,
        }, { quoted: messageDetails });
      } catch (error) {
        console.error('Erro ao enviar áudio:', error);
      }
    };
  
  
  
  
  const enviarImagem = async (arquivo, text) => {
    try {
      // Verifica se 'arquivo' é uma URL (string que começa com 'http')
      if (typeof arquivo === 'string' && arquivo.startsWith('http')) {
        // Envia a imagem diretamente pela URL
        await pico.sendMessage(from, {
          image: { url: arquivo }, // Envia a imagem pela URL
          caption: text
        }, { quoted: messageDetails });
      } else if (Buffer.isBuffer(arquivo)) {
        // Se 'arquivo' for um Buffer (dados binários da imagem)
        await pico.sendMessage(from, {
          image: arquivo,  // Envia a imagem a partir do Buffer
          caption: text
        }, { quoted: messageDetails });
      } else if (typeof arquivo === 'string') {
        // Se 'arquivo' for um caminho local, lê o arquivo diretamente
        if (fs.existsSync(arquivo)) {
          // Lê o arquivo de imagem como Buffer
          const imageBuffer = fs.readFileSync(arquivo);
  
          // Envia a imagem a partir do Buffer
          await pico.sendMessage(from, {
            image: imageBuffer,  // Envia a imagem a partir do Buffer
            caption: text
          }, { quoted: messageDetails });
        } else {
          console.error('Arquivo não encontrado:', arquivo);
        }
      } else {
        console.error('O arquivo ou URL não é válido:', arquivo);
      }
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
    }
  };
  
    
  
  
    const enviarVideo = async (arquivo, text) => {
      try {
        await pico.sendMessage(from, {
          video: fs.readFileSync(arquivo),
          caption: text,
          mimetype: "video/mp4"
        }, { quoted: messageDetails });
      } catch (error) {
        console.error('Erro ao enviar vídeo:', error);
      }
    };
  
    const enviarDocumento = async (arquivo, text) => {
      try {
        await pico.sendMessage(from, {
          document: fs.readFileSync(arquivo),
          caption: text
        }, { quoted: messageDetails });
      } catch (error) {
        console.error('Erro ao enviar documento:', error);
      }
    };
  
    const enviarSticker = async (arquivo) => {
      try {
        await pico.sendMessage(from, {
          sticker: fs.readFileSync(arquivo)
        }, { quoted: messageDetails });
      } catch (error) {
        console.error('Erro ao enviar sticker:', error);
      }
    };
  
    const enviarLocalizacao = async (latitude, longitude, text) => {
      try {
        await pico.sendMessage(from, {
          location: { latitude, longitude, caption: text }
        }, { quoted: messageDetails });
      } catch (error) {
        console.error('Erro ao enviar localização:', error);
      }
    };
  
    const enviarContato = async (numero, nome) => {
      try {
        await pico.sendMessage(from, {
          contact: {
            phone: numero,
            name: { formattedName: nome }
          }
        }, { quoted: messageDetails });
      } catch (error) {
        console.error('Erro ao enviar contato:', error);
      }
    };
  
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
  