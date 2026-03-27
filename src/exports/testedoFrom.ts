export async function formatFrom (messageDetails) {
        const message = messageDetails[0];
        const fromt = message.key.remoteJid;

    return{
        fromt
    }
}



