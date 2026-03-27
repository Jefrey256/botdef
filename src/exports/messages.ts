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
    // Verificação de que messageDetails está definido e possui uma estrutura válida
    if (!messageDetails || !messageDetails.message) {
      console.error("Detalhes da mensagem não encontrados ou estão mal formatados");
      return {
        media: undefined,
        mentions: [],
        fullMessage: "",
        from: "Desconhecido",
        fromUser: "Desconhecido",
        isCommand: false,
        commandName: "",
        args: [],
        userName: "Desconhecido",
         userRole: "membro",
        participant: null,
      };
    }
    

  
    // Captura todas as possíveis fontes de texto (mensagem simples, legenda ou texto citado)
    const textMessage = messageDetails.message?.conversation || ""; // Mensagem simples
    const extendedTextMessage = messageDetails.message?.extendedTextMessage?.text ||
    messageDetails.message?.extendedTextMessage?.text || ""; // Texto estendido
    const imageTextMessage = messageDetails.message?.imageMessage?.caption || ""; // Legenda da imagem
    const videoTextMessage = messageDetails.message?.videoMessage?.caption || ""; // Legenda do vídeo
    const quotedMessage =
      messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation || ""; // Texto citado
  
    // Compõe o fullMessage a partir da prioridade (texto direto > legenda > citado)
    const fullMessage =
      textMessage || extendedTextMessage || imageTextMessage || videoTextMessage || quotedMessage;
  
    // Extrai menções de pessoas mencionadas na mensagem
    const mentions = messageDetails.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    
    // Extrai o nome do usuário ou identificador
    const fromUser = messageDetails.key?.participant?.split("@")[0] || messageDetails.key?.remoteJid?.split("@")[0];
      const userName = messageDetails.pushName || fromUser;
    //
    //
    const fromUserAdm = messageDetails.key?.participant 
    ? messageDetails.key?.participant.split('@')[0]  // Se for de um grupo, usa o participant
    : messageDetails.key?.remoteJid.split('@')[0];   // Se for de um canal ou PV, usa o remoteJid

    //
    const groupId = messageDetails.key?.remoteJid || null;
    //
    
    // Extrai o identificador do remetente
    const from = messageDetails.key?.remoteJid || "Remetente desconhecido";
    
    // Extrai o nome de exibição do usuário
    //const userName = messageDetails?.pushName || "Usuário Desconhecido";
    const phoneNumber = messageDetails?.key?.participant?.replace(   
      /:[0-9][0-9]|:[0-9]/g,
      "");
    
    // Verifica se a mensagem é um comando (com base no prefixo)
    const isCommand = fullMessage.startsWith(PREFIX);
  
    // Extrai o nome do comando e argumentos
    const commandName = isCommand ? fullMessage.slice(PREFIX.length).split(" ")[0] : "";
    const args = isCommand ? fullMessage.slice(PREFIX.length).split(" ").slice(1) : [];
    const key = messageDetails.key || null;
    const quotedKey = messageDetails?.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
    //
    const quoted = messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage || 
               messageDetails.message?.imageMessage?.contextInfo?.quotedMessage ||
               messageDetails.message?.videoMessage?.contextInfo?.quotedMessage ||
               messageDetails.message?.audioMessage?.contextInfo?.quotedMessage ||
               messageDetails.message?.documentMessage?.contextInfo?.quotedMessage;
               

    //
    //
    const messageContent = messageDetails.message?.extendedTextMessage?.text || 
    messageDetails.message?.text
    //
  
    // Verificação de mídia (direta ou marcada)
    const media =
      messageDetails.message?.imageMessage ||
      messageDetails.message?.videoMessage ||
      messageDetails.message?.audioMessage ||
      messageDetails.message?.stickerMessage ||
      messageDetails.message?.documentMessage ||
      messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
      messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
      messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage ||
      messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage ||
      messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.documentMessage ||

      messageDetails.message?.key?.contextInfo?.quotedMessage||

      undefined;
  
    return {
      messageContent,
      key,
      quoted,
      quotedKey,
      media,
      mentions,
      fullMessage,
      from,
      phoneNumber,
      fromUser,
      isCommand,
      commandName,
      args,
      textMessage,
      userName,
      groupId,
      participant: messageDetails.key?.participant || messageDetails.key?.remoteJid,
    };
    console.log(`ola: ${phoneNumber}`)



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
          mimetype: "audio/mp4",
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
  