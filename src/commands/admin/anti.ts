import { db } from "../system/database";

export async function antilink(sock: any, from: string, msg: any) {
  const text = msg.message?.conversation || "";

  if (text.includes("on")) {
    db.prepare("INSERT OR REPLACE INTO settings (groupId, antilink) VALUES (?, 1)")
      .run(from);
    await sock.sendMessage(from, { text: "✅ Anti-link ativado" });
  }

  if (text.includes("off")) {
    db.prepare("INSERT OR REPLACE INTO settings (groupId, antilink) VALUES (?, 0)")
      .run(from);
    await sock.sendMessage(from, { text: "❌ Anti-link desativado" });
  }
}