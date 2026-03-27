export async function isAdmin(sock: any, jid: string, user: string) {
  const group = await sock.groupMetadata(jid);
  const participant = group.participants.find(p => p.id === user);
  return participant?.admin !== null;
}