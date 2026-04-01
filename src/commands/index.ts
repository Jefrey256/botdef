import { extractMessage, setupMessagingServices } from "../exports/messages";
import { OWNER_NUMBER } from "../config";

// comandos
import { menu } from "./users/menu";
import { ping } from "./users/ping";
import { stickerAll } from "./users/sticker";
import { alterarP } from "./owner/ftperfil";
import { videoDow } from "./users/dow";
import { testeDel } from "./admin/delete";
import { createImageSticker1 } from "./users/tesStk";
import { velha } from "./users/velha";
import { toimg } from "./users/toimg";

// comandos restritos
const adminCommands = ["ft", "del", "ping", "ban", "kick", "antilink", "mutar", "desmutar"];

// 📌 PEGAR CARGO
async function getUserRole(pico: any, groupId: string, user: string) {
  try {
    if (!groupId.includes("@g.us")) return "membro";

    const group = await pico.groupMetadata(groupId);
    const isAdmin = group.participants.some(
      (p: any) => p.admin && p.id.split("@")[0] === user
    );

    if (user === OWNER_NUMBER) return "dono";
    if (isAdmin) return "admin";

    return "membro";
  } catch {
    return "membro";
  }
}

// 🚀 HANDLER
export async function handleMenuCommand(pico: any, from: string, messageDetails: any) {
  
  // ❌ evita loop do bot
  if (messageDetails.key.fromMe) return;

  const { enviarTexto } = setupMessagingServices(pico, from, messageDetails);

  const {
    fullMessage,
    commandName,
    fromUser,
    isCommand,
    text,
    userName,
    groupId
  } = extractMessage(messageDetails);

  // 📌 LOG
  if (isCommand) {
    console.log(`» ${userName} → ${commandName}`);
  } else {
    console.log(`💬 ${userName}: ${text}`);
  }

  // 📦 COMANDOS
  const commands: any = {
    toimg: toimg,
    velha,
    help: menu,
    menu,
    ft: alterarP,
    d: videoDow,
    ping,
    s: stickerAll,
    togif: stickerAll,
    pi: createImageSticker1,
    del: testeDel
  };

  if (!isCommand) return;

  // 📌 cargo
  const role = await getUserRole(pico, groupId, fromUser);

  // 🔒 bloqueio
  if (adminCommands.includes(commandName) && role === "membro") {
    return enviarTexto("🚫 Você não tem permissão.");
  }

  // 🚀 execução
  const cmd = commands[commandName];

  if (!cmd) {
    return enviarTexto(`❌ Comando "${commandName}" não existe.`);
  }

  try {
    await cmd(pico, from, messageDetails);
    console.log(`✅ ${commandName} executado`);
  } catch (err: any) {
    console.error(err);
    await enviarTexto(`❌ Erro: ${err.message}`);
  }
}