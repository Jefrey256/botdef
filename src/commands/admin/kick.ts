export async function kick(sock: any, from: string, msg: any) {
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

  if (!mentioned) return;

  await sock.groupParticipantsUpdate(from, mentioned, "remove");
}