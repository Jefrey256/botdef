import { db } from "./database";

export function iniciarAntiLink(sock: any) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const groupId = msg.key.remoteJid!;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    const setting = db
      .prepare("SELECT antilink FROM settings WHERE groupId = ?")
      .get(groupId);

    if (!setting?.antilink) return;

    if (text.includes("chat.whatsapp.com")) {
      await sock.sendMessage(groupId, { delete: msg.key });
    }
  });
}