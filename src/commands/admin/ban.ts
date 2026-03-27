export async function ban(sock: any, from: string, msg: any) {
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

  if (!mentioned) return;

  try {
    await sock.groupParticipantsUpdate(from, mentioned, "remove");

    await sock.sendMessage(from, {
      text: "🚫 Usuário banido do grupo",
    });
  } catch (e) {
    console.log("Erro no ban:", e);
  }
}