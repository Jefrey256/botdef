import { load, save } from "./database";

export function iniciarSistemaMute(sock: any) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const groupId = msg.key.remoteJid!;
    const sender =
      msg.key.participant ||
      msg.key.remoteJid!;

    const db = load();

    const mute = db.mutes.find(
      (m: any) => m.user === sender && m.groupId === groupId
    );

    if (!mute) return;

    // expirou
    if (Date.now() > mute.expire) {
      db.mutes = db.mutes.filter(
        (m: any) => !(m.user === sender && m.groupId === groupId)
      );
      save(db);
      return;
    }

    // 🔥 APAGA MENSAGEM
    try {
      await sock.sendMessage(groupId, {
        delete: msg.key,
      });
    } catch (e) {
      console.log("Erro ao deletar:", e);
    }
  });
}