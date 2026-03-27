"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.menu = menu;
const messages_1 = require("../../exports/messages");
const caption_1 = require("../caption");
function menu(pico, from, messageDetails, userName, fromUser, messages) {
    return __awaiter(this, void 0, void 0, function* () {
        const { enviarTexto, enviarImagem, enviarAudioGravacao } = (0, messages_1.setupMessagingServices)(pico, from, messageDetails);
        try {
            yield enviarAudioGravacao("database/assets/audios/menucmd.mp3");
            yield enviarImagem("database/assets/imgs/menu.png", (0, caption_1.menuCaption)(messageDetails));
        }
        catch (error) {
            console.log("errror");
        }
    });
}
