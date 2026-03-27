import { setupMessagingServices } from "../../exports/messages";


export async function ping (pico, from, messageDetails) {
    const {enviarTexto} = setupMessagingServices(pico, from, messageDetails)


    await enviarTexto("Pong!!!")
}