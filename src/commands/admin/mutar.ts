import { db } from "../system/database";

function parseTime(time: string): number {
  const num = parseInt(time);
  if (time.endsWith("s")) return num * 1000;
  if (time.endsWith("m")) return num * 60000;
  if (time.endsWith("h")) return num * 3600000;
  return 0;
}

export async function mutar(sock: any, from: string, msg: any) {
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  const text = msg.message?.extendedTextMessage?.text || "";
  const args = text.split(" ");

  if (!mentioned || !args[1]) return;

  const time = parseTime(args[1]);
  if (!time) return;

  const expire = Date.now() + time;

  mentioned.forEach((u: string) => {
    db.prepare(
      "INSERT INTO mutes (user, groupId, expire) VALUES (?, ?, ?)"
    ).run(u, from, expire);
  });

  await sock.sendMessage(from, {
    text: `🔇 Mutado por ${args[1]}`,
  });
}