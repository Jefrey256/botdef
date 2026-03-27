export async function ban(sock: any, from: string, msg: any) {
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

  if (!mentioned) return;

  await sock.groupParticipantsUpdate(from, mentioned, "remove");

  mentioned.forEach(async (u: string) => {
    await sock.updateBlockStatus(u, "block");
  });
}