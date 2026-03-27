import { db } from "./database";

export function iniciarSistemaMute(sock: any) {
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const groupId = msg.key.remoteJid!;
    const sender = msg.key.participant || msg.key.remoteJid!;

    const mute = db.prepare(
      "SELECT * FROM mutes WHERE user = ? AND groupId = ?"
    ).get(sender, groupId);

    if (!mute) return;

    if (Date.now() > mute.expire) {
      db.prepare("DELETE FROM mutes WHERE user = ? AND groupId = ?")
        .run(sender, groupId);
      return;
    }

    try {
      await sock.sendMessage(groupId, { delete: msg.key });
    } catch {}
  });
}