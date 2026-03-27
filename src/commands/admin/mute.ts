import fs from "fs";
import path from "path";
import { extractMessage, setupMessagingServices } from "../../exports/messages";
//import "../../../assets/json/muted.json"
// Arquivo que armazena os usuários mutados

const FILE = path.join(process.cwd(), "assets", "json", "muted.json");

// Carregar dados
let muted: Record<string, number> = {};
if (fs.existsSync(FILE)) {
  try {
    muted = JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    muted = {};
  }
}

// Salvar dados
function saveMuted() {
  fs.writeFileSync(FILE, JSON.stringify(muted, null, 2));
}

// Converter tempo "10m", "30s", "1h"
function parseTime(time: string): number {
  const num = parseInt(time);
  if (time.endsWith("s")) return num * 1000;
  if (time.endsWith("m")) return num * 60 * 1000;
  if (time.endsWith("h")) return num * 60 * 60 * 1000;
  if (!isNaN(num)) return num * 60 * 1000; // assume minutos por padrão
  return 0;
}

// Função exportada do comando
export async function mutar(pico: any, from: string, messageDetails: any) {
  const { enviarTexto } = setupMessagingServices(pico, from, messageDetails);
  const { fullMessage,  } = extractMessage(messageDetails);

  const text = fullMessage.trim();

  // .mutar @user 10m
  if (!text.startsWith(".mutar")) return;

  const mentioned =
    messageDetails.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  const args = text.split(" ");

  if (!mentioned || !args[1]) {
    await enviarTexto("Uso correto: .mutar @usuário 10m");
    return;
  }

  const timeMs = parseTime(args[1]);
  if (timeMs === 0) {
    await enviarTexto("Tempo inválido! Ex: 10m, 30s, 1h");
    return;
  }

  const expire = Date.now() + timeMs;
  mentioned.forEach((user) => {
    muted[user] = expire;
  });

  saveMuted();
  await enviarTexto(`🔇 Usuário(s) mutado(s) por ${args[1]}`);

  // Bloquear mensagens futuras do usuário mutado automaticamente
  pico.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const jid = msg.key.remoteJid!;
    const msgSender = msg.key.participant || msg.key.remoteJid!;
    if (muted[msgSender]) {
      if (Date.now() > muted[msgSender]) {
        delete muted[msgSender];
        saveMuted();
      } else {
        try {
          await pico.sendMessage(jid, { delete: msg.key });
        } catch {}
        return;
      }
    }
  });
}

// Também podemos criar a função desmutar
export async function desmutar(pico: any, from: string, messageDetails: any) {
  const { enviarTexto } = setupMessagingServices(pico, from, messageDetails);
  const mentioned =
    messageDetails.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (!mentioned) {
    await enviarTexto("Uso correto: .desmutar @usuário");
    return;
  }

  mentioned.forEach((user) => delete muted[user]);
  saveMuted();
  await enviarTexto("🔊 Usuário(s) desmutado(s)!");
}