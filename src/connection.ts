import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { pino } from "pino";
import path from "path";
//import { iniciarSistemaMute } from "./commands/system/muteSystem";
//import { iniciarAntiLink } from "./commands/system/antiLink";
import { extractMessage } from "./exports/messages";
import { getMediaContent } from "./exports/dowMedia";
import { handleMenuCommand } from "./commands";
import { question, logger } from "./exports";

export async function reng() {
    const logger = pino({ level: "silent" });
    const { version } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(path.resolve(__dirname, "../database/qr-code"));
    

    const riko = makeWASocket({
        version,
        logger,
        printQRInTerminal: false, // Desativamos para exibir manualmente
        auth: state,
        defaultQueryTimeoutMs: undefined,
        markOnlineOnConnect: true,

        syncFullHistory: true
    });
    console.log(riko);
   // iniciarSistemaMute(riko)
    //iniciarAntiLink(riko)

    riko.ev.on("connection.update", (update)=>{
        const {connection, lastDisconnect } = update

        if (connection === 'close'){
            const shoudlReconnect = (lastDisconnect?.error as any)?.statusCode  !== DisconnectReason.loggedOut

            console.log("conexao fechada devido ao erro:",lastDisconnect?.error, "tentando reconectar:", shoudlReconnect)

            if (shoudlReconnect) reng()
        }
    else if (connection === "open"){
        console.log("conexao aberta com sucesso")
    }

    })

    if (!state.creds?.registered){
        let phoneNumber = await question("Digite o número de telefone (com código do país, ex: +5511999999999): ");
        phoneNumber = phoneNumber.replace(/[^0-9]/g,"")
        
        if (!phoneNumber){
            throw new Error("numero de telefone inválido")
        }

        const code: string = await riko.requestPairingCode(phoneNumber)
        console.log(`codigo de pareamento enviado para ${phoneNumber}: ${code}`) 
    }

   
    riko.ev.on("creds.update", saveCreds);
    //
    riko.ev.on("messages.upsert", async (pi) => {
        try {
            const message = pi.messages && pi.messages[0];
            if (!message || !message.message) return; // Ignora mensagens inválidas
    
            const tfrom = message.key.remoteJid;
            const fromUser =
                message.key?.participant?.split("@")[0] || message.key?.remoteJid?.split("@")[0];
            const userName = message.pushName || fromUser; // Nome do usuário ou número
            const messageText = message.message?.conversation || 
                                message.message?.extendedTextMessage?.text || '';
    
            // Ignora mensagens enviadas pelo próprio bot
            //if (message.key.fromMe) return;
    
            // Extrai mensagem completa e verifica se é um comando
            const { fullMessage, isCommand } = extractMessage(message);
    
            console.log(`Mensagem recebida de ${userName}: ${fullMessage}`);
            const messageType = message?.message ? Object.keys(message.message)[0] : null;
            if (messageType) console.log(`Tipo de mensagem: ${messageType}`);
            
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted) console.log("Mensagem citada:", quoted);
    
            // Tratamento de comandos
            if (isCommand) {
                console.log("Processando comando...");
                await handleMenuCommand(riko, tfrom, message);
                return;
            }
    
            // Resposta automática para mensagens "oi" ou "ola"
            if (messageText) {
                const toLowerCase = messageText.toLowerCase();
                if (toLowerCase.includes("oi") || toLowerCase.includes("ola")) {
                    console.log("Respondendo a saudação...");
                    //await pico.sendMessage(tfrom, { text: "Olá, tudo bem?" });
                }
            }
        } catch (error) {
            console.error("Erro ao processar a mensagem:", error);
        }
    });
    //
    
    //
    
   
    return riko;
}
