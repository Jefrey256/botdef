import { WASocket } from '@whiskeysockets/baileys';
import { setupMessagingServices } from '../../exports/messages';

export async function delMarkedMessage(pico: WASocket, from: string, quotedKey: { id: string; remoteJid: string; participant?: string }) {
    const { enviarTexto } = setupMessagingServices(pico, from, quotedKey);
    if (quotedKey) {
        await pico.sendMessage(from, {
            delete: {
                remoteJid: quotedKey.remoteJid,
                id: quotedKey.id,
                participant: quotedKey.participant || undefined, // Necessário para grupos
            },
        });
    } else {
        await enviarTexto('Nenhuma mensagem marcada para apagar.');
        //console.error('Nenhuma mensagem marcada para apagar.');
    }
}

export async function testeDel(pico: WASocket, from: string, quoted: any) {
    const { enviarTexto } = setupMessagingServices(pico, from, quoted);
    //console.log(`Dados recebidos para exclusão:`, quoted);

    // Verificar se a mensagem contém contextInfo com a mensagem citada
    if (quoted?.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const contextInfo = quoted.message.extendedTextMessage.contextInfo;

        const quotedKey = {
            id: contextInfo.stanzaId, // ID da mensagem marcada
            remoteJid: contextInfo.participant || from, // JID do remetente da mensagem marcada
            participant: contextInfo.participant, // Para mensagens em grupos
        };

        //console.log(`Excluindo mensagem citada: ${quotedKey.id}`);
        await delMarkedMessage(pico, from, quotedKey);
    } else {
        await enviarTexto('Nenhuma mensagem citada foi encontrada para exclusão.');
       // console.error('Nenhuma mensagem citada foi encontrada para exclusão.');
    }
}
