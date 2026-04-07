import { addMute } from "../system/systemMute";

export async function mutar(pico: any, from: string, messageDetails: any) {
    const user = messageDetails.key.participant;
    const args = messageDetails.message?.conversation?.split(" ");

    if (!args[1]) {
        await pico.sendMessage(from, { text: "Use: !mutar 60 (segundos)" });
        return;
    }

    const tempo = parseInt(args[1]) * 1000;

    addMute(user, from, tempo);

    await pico.sendMessage(from, { text: `Usuário mutado por ${args[1]} segundos.` });
}