import { load, save } from "../system/database";

export async function antilink(sock: any, from: string, msg: any) {
  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    "";

  const db = load();

  if (!db.settings[from]) {
    db.settings[from] = {};
  }

  if (text.includes("on")) {
    db.settings[from].antilink = true;
    save(db);

    await sock.sendMessage(from, {
      text: "✅ Anti-link ativado",
    });
  }

  if (text.includes("off")) {
    db.settings[from].antilink = false;
    save(db);

    await sock.sendMessage(from, {
      text: "❌ Anti-link desativado",
    });
  }
}