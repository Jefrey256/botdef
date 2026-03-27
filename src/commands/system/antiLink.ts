import { load } from "./database";

export function iniciarAntiLink(sock: any) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const groupId = msg.key.remoteJid!;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    const db = load();

    // verifica se anti-link tá ligado no grupo
    if (!db.settings[groupId]?.antilink) return;

    // detecta link (melhorado)
    const isLink = /(https?:\/\/|www\.|chat\.whatsapp\.com)/gi.test(text);

    if (isLink) {
      try {
        await sock.sendMessage(groupId, {
          delete: msg.key,
        });
      } catch (e) {
        console.log("Erro ao deletar link:", e);
      }
    }
  });
}