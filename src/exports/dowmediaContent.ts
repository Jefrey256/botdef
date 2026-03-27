import { getMediaContent } from './dowMedia';  // Importe a função getMediaContent
import * as fs from 'fs';
import * as path from 'path';
import { proto } from '@whiskeysockets/baileys'; // Importa os tipos do baileys

/**
 * Função para baixar e salvar uma imagem (ou outro tipo de mídia).
 * @param pico Instância do cliente Baileys
 * @param from Número do remetente
 * @param messageDetails Detalhes da mensagem recebida
 * @param outputFolder Diretório de saída para salvar o arquivo
 */
export async function downloadImage(pico: any, from: string, messageDetails: proto.IMessage, outputFolder: string) {
  try {
    // Usando a função getMediaContent para obter a mídia (passando buffer como true para obter o conteúdo completo em Buffer)
    const buffer = await getMediaContent(true, messageDetails);  // Baixando como Buffer

    // Crie o diretório de saída, caso não exista
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    // Gerar um nome para o arquivo (usando timestamp para garantir que o nome seja único)
    const fileName = `${Date.now()}.jpg`;  // Você pode usar outras extensões dependendo do tipo de mídia
    const outputFilePath = path.join(outputFolder, fileName);

    // Escrevendo o Buffer no arquivo
    fs.writeFileSync(outputFilePath, buffer);

    // Confirmar que o arquivo foi salvo
    console.log(`Imagem salva em: ${outputFilePath}`);
    await pico.sendMessage(from, { text: `Imagem salva em: ${outputFilePath}` });

  } catch (error) {
    console.error("Erro ao baixar a mídia:", error);
    await pico.sendMessage(from, { text: "Erro ao processar a imagem." });
  }
}

//baixar video video

export async function downloadVideo(pico: any, from: string, messageDetails: proto.IMessage, outputFolder: string) {
  try {
    // Usando a função getMediaContent para obter a mídia (passando buffer como true para obter o conteúdo completo em Buffer)
    const buffer = await getMediaContent(true, messageDetails);  // Baixando como Buffer

    // Crie o diretório de saída, caso não exista
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    // Gerar um nome para o arquivo (usando timestamp para garantir que o nome seja único)
    const fileName = `${Date.now()}.mp4`;  // Você pode usar outras extensões dependendo do tipo de mídia
    const outputFilePath = path.join(outputFolder, fileName);

    // Escrevendo o Buffer no arquivo
    fs.writeFileSync(outputFilePath, buffer);

    // Confirmar que o arquivo foi salvo
    console.log(`Imagem salva em: ${outputFilePath}`);
    await pico.sendMessage(from, { text: `Imagem salva em: ${outputFilePath}` });

  } catch (error) {
    console.error("Erro ao baixar a mídia:", error);
    await pico.sendMessage(from, { text: "Erro ao processar a imagem." });
  }
}

//baixar sticker
