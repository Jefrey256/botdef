import { load, save } from "../system/database";

function parseTime(time: string): number {
  const num = parseInt(time);
  if (time.endsWith("s")) return num * 1000;
  if (time.endsWith("m")) return num * 60000;
  if (time.endsWith("h")) return num * 3600000;
  if (!isNaN(num)) return num * 60000; // padrão minutos
  return 0;
}

export async function mutar(sock: any, from: string, msg: any) {
  const mentioned =
    msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    "";

  const args = text.split(" ");

  if (!mentioned || !args[1]) {
    await sock.sendMessage(from, {
      text: "Uso: .mutar @user 10m",
    });
    return;
  }

  const time = parseTime(args[1]);
  if (!time) {
    await sock.sendMessage(from, {
      text: "Tempo inválido (10s, 5m, 1h)",
    });
    return;
  }

  const db = load();

  if (!db.mutes[from]) db.mutes[from] = {};

  const expire = Date.now() + time;

  mentioned.forEach((u: string) => {
    db.mutes[from][u] = expire;
  });

  save(db);

  await sock.sendMessage(from, {
    text: `🔇 Mutado por ${args[1]}`,
  });
}