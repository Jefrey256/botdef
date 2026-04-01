import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { extractMessage, setupMessagingServices } from "../../exports/messages";
import { Boom } from "@hapi/boom";

export const toimg = async (pico: any, from: string, messageDetails: any) => {
  const { enviarTexto } = setupMessagingServices(pico, from, messageDetails);
  const { quoted } = extractMessage(messageDetails);

  // ✅ verifica se é figurinha
  if (!quoted?.stickerMessage) {
    return enviarTexto("❌ Responda uma figurinha!");
  }

  try {
    // 📦 montar mensagem corretamente
    const mediaMsg = {
      key: messageDetails.key,
      message: quoted
    };

    // 📥 baixar figurinha (CORRIGIDO)
    const buffer = await downloadMediaMessage(
      mediaMsg,
      "buffer",
      {},
      {
        reuploadRequest: pico.updateMediaMessage,
        logger: pico.logger
      }
    );

    const input = `./tmp/${Date.now()}.webp`;
    const output = `./tmp/${Date.now()}.png`;

    // 💾 salvar arquivo webp
    fs.writeFileSync(input, buffer);

    // 🔁 converter webp → png
    await new Promise((resolve, reject) => {
      ffmpeg(input)
        .toFormat("png")
        .on("end", resolve)
        .on("error", reject)
        .save(output);
    });

    // 📤 enviar imagem
    await pico.sendMessage(
      from,
      {
        image: fs.readFileSync(output),
        caption: "🖼️ Aqui está sua imagem!"
      },
      { quoted: messageDetails }
    );

    // 🧹 limpar arquivos
    fs.unlinkSync(input);
    fs.unlinkSync(output);

  } catch (err) {
    console.error("ERRO TOIMG:", err);
    enviarTexto("❌ Erro ao converter figurinha.");
  }
};