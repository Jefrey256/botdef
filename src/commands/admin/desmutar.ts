import { removeMuted } from "../system/muteStore";

export async function desmutar(sock: any, from: string, msg: any) {
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

  if (!mentioned) return;

  mentioned.forEach((u: string) => removeMuted(u));

  await sock.sendMessage(from, {
    text: "🔊 Desmutado!",
  });
}