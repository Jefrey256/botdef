import { downloadVideo } from "../../exports/dowmediaContent";
import { proto } from "@whiskeysockets/baileys"; // Importando os tipos necessários
import { extractMessage } from "../../exports/messages";
/**
 * Função que lida com a mensagem e verifica se contém mídia
 * @param pico Instância do cliente Baileys
 * @param from Número do remetente
 * @param messageDetails Detalhes da mensagem recebida
 */
export async function videoDow(pico: any, from: string, messageDetails: proto.IMessage) {
  const outputFolder = './assets/videos';  // Caminho onde as mídias serão salvas

  // Verifica se a mensagem contém mídia
  const { media } = extractMessage(messageDetails);  // Usando a função extractMessage para verificar a mídia na mensagem

  if (media) {
    // Se for uma imagem, chama a função para fazer o download da imagem
    if (media instanceof proto.Message.VideoMessage) {
      await downloadVideo(pico, from, messageDetails, outputFolder);
    }
    // Caso contrário, trate outros tipos de mídia ou mensagens de texto
    else {
      console.log("Tipo de mídia não suportado ou não é uma imagem.");
      await pico.sendMessage(from, { text: "Somente videos podem ser baixadas." });
    }
  } else {
    console.log("Nenhuma mídia encontrada na mensagem.");
    await pico.sendMessage(from, { text: "Nenhuma mídia foi enviada." });
  }
}