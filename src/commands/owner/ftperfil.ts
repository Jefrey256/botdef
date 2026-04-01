import { join } from "path";
import { writeFile, mkdir } from "fs/promises";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { extractMessage } from "../../exports/messages";

/**
 * Função para baixar uma imagem e salvar como `banner.png` na pasta `assets/img`.
 */
export async function alterarP(pico: any, from: string, messageDetails: any) {
  const {imageMessage} = extractMessage(messageDetails);
  

  if (!imageMessage) {
    console.log("Nenhuma imagem encontrada.");
    await pico.sendMessage(from, { text: "Envie ou marque uma imagem para substituir o banner." });
    return;
  }

  try {
    // Diretório de saída
    const outputFolder = join(__dirname, "../../../database/assets/imgs");
    await mkdir(outputFolder, { recursive: true });

    const filePath = join(outputFolder, "menu.png"); // Definindo o nome fixo da imagem como "banner.png"

    // Baixar imagem
    const stream = await downloadContentFromMessage(imageMessage, "image");
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    // Salvar a imagem com o nome fixo "banner.png" substituindo a imagem existente
    await writeFile(filePath, Buffer.concat(chunks));
    console.log(`Imagem substituída por banner.png em: ${filePath}`);

    // Confirmação ao usuário
    await pico.sendMessage(from, { text: "Banner substituído com sucesso." });

  } catch (error) {
    console.error("Erro ao substituir o banner:", error);
    await pico.sendMessage(from, { text: "Erro ao substituir o banner. Tente novamente." });
  }
}