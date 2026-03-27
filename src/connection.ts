import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { pino } from "pino";
import path from "path";
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
    
    return riko;
}