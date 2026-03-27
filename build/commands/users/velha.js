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
exports.comandoVelha = comandoVelha;
exports.aceitarVelha = aceitarVelha;
exports.velha = velha;
const uuid_1 = require("uuid");
const jogosAtivos = new Map();
// Emojis
const EMOJI_X = "❌";
const EMOJI_O = "⭕";
const EMOJI_VAZIO = "⬜";
function renderTabuleiro(tabuleiro) {
    let str = "";
    for (let i = 0; i < 9; i++) {
        str += tabuleiro[i] || EMOJI_VAZIO;
        if ((i + 1) % 3 === 0)
            str += "\n";
    }
    return str;
}
function verificarVencedor(tabuleiro) {
    const combinacoes = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
        [0, 4, 8], [2, 4, 6] // diagonais
    ];
    for (const [a, b, c] of combinacoes) {
        if (tabuleiro[a] && tabuleiro[a] === tabuleiro[b] && tabuleiro[a] === tabuleiro[c])
            return tabuleiro[a];
    }
    return null;
}
function comandoVelha(pico, from, messageDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const msg = messageDetails.message;
        const text = (msg === null || msg === void 0 ? void 0 : msg.conversation) || ((_a = msg === null || msg === void 0 ? void 0 : msg.extendedTextMessage) === null || _a === void 0 ? void 0 : _a.text) || "";
        const mencionados = ((_c = (_b = msg === null || msg === void 0 ? void 0 : msg.extendedTextMessage) === null || _b === void 0 ? void 0 : _b.contextInfo) === null || _c === void 0 ? void 0 : _c.mentionedJid) || [];
        if (!text.startsWith(".velha") || mencionados.length === 0) {
            yield pico.sendMessage(from, { text: "Marque o adversário: .velha @usuario" });
            return;
        }
        const adversario = mencionados[0];
        const desafiante = messageDetails.key.participant || messageDetails.key.remoteJid;
        if (desafiante === adversario) {
            yield pico.sendMessage(from, { text: "Você não pode jogar contra si mesmo!" });
            return;
        }
        // Verifica se já existe jogo ativo com esses usuários
        for (const jogo of jogosAtivos.values()) {
            if ((jogo.jogadorX === desafiante && jogo.jogadorO === adversario) ||
                (jogo.jogadorO === desafiante && jogo.jogadorX === adversario)) {
                yield pico.sendMessage(from, { text: "Já existe um jogo ativo entre vocês!" });
                return;
            }
        }
        // Criar novo desafio
        const idJogo = (0, uuid_1.v4)();
        const tabuleiro = Array(9).fill("");
        const novoJogo = {
            id: idJogo,
            jogadorX: desafiante,
            jogadorO: adversario,
            tabuleiro,
            turno: "X",
            grupo: from,
            ativo: false
        };
        jogosAtivos.set(idJogo, novoJogo);
        yield pico.sendMessage(from, {
            text: `🎮 DESAFIO\n\n@${desafiante.split("@")[0]} vs @${adversario.split("@")[0]}\n\n` +
                `👉 @${adversario.split("@")[0]} responda esta mensagem com:\n` +
                `"aceitar", "sim" ou 👍 para começar`,
            contextInfo: { mentionedJid: [desafiante, adversario] }
        });
    });
}
// Aceitar desafio
function aceitarVelha(pico, from, messageDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const msg = messageDetails.message;
        const text = ((_a = msg === null || msg === void 0 ? void 0 : msg.conversation) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || ((_c = (_b = msg === null || msg === void 0 ? void 0 : msg.extendedTextMessage) === null || _b === void 0 ? void 0 : _b.text) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || "";
        const participante = messageDetails.key.participant || messageDetails.key.remoteJid;
        if (!["aceitar", "sim", "👍"].includes(text))
            return;
        // Encontrar o jogo pendente desse usuário
        const jogo = Array.from(jogosAtivos.values()).find(j => j.jogadorO === participante && !j.ativo);
        if (!jogo)
            return;
        jogo.ativo = true;
        yield pico.sendMessage(from, {
            text: `✅ Jogo iniciado!\n` +
                renderTabuleiro(jogo.tabuleiro) +
                `\nTurno: @${jogo.jogadorX.split("@")[0]} (${EMOJI_X})`,
            contextInfo: { mentionedJid: [jogo.jogadorX] }
        });
    });
}
// Jogar no tabuleiro
function velha(pico, from, messageDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const msg = messageDetails.message;
        const text = (msg === null || msg === void 0 ? void 0 : msg.conversation) || ((_a = msg === null || msg === void 0 ? void 0 : msg.extendedTextMessage) === null || _a === void 0 ? void 0 : _a.text) || "";
        const participante = messageDetails.key.participant || messageDetails.key.remoteJid;
        // Deve ser um número de 1 a 9
        const pos = parseInt(text) - 1;
        if (isNaN(pos) || pos < 0 || pos > 8)
            return;
        // Encontrar jogo ativo do participante
        const jogo = Array.from(jogosAtivos.values()).find(j => j.ativo && (j.jogadorX === participante || j.jogadorO === participante));
        if (!jogo)
            return;
        const simbolo = (jogo.turno === "X") ? EMOJI_X : EMOJI_O;
        if ((jogo.turno === "X" && participante !== jogo.jogadorX) ||
            (jogo.turno === "O" && participante !== jogo.jogadorO)) {
            yield pico.sendMessage(from, { text: "Não é seu turno!" });
            return;
        }
        if (jogo.tabuleiro[pos] !== "") {
            yield pico.sendMessage(from, { text: "Posição já ocupada!" });
            return;
        }
        jogo.tabuleiro[pos] = simbolo;
        // Verifica vencedor
        const vencedor = verificarVencedor(jogo.tabuleiro);
        if (vencedor) {
            yield pico.sendMessage(from, {
                text: `🏆 Vencedor: ${vencedor}\n` + renderTabuleiro(jogo.tabuleiro)
            });
            jogosAtivos.delete(jogo.id);
            return;
        }
        // Verifica empate
        if (jogo.tabuleiro.every(c => c !== "")) {
            yield pico.sendMessage(from, {
                text: `⚖️ Empate!\n` + renderTabuleiro(jogo.tabuleiro)
            });
            jogosAtivos.delete(jogo.id);
            return;
        }
        // Troca turno
        jogo.turno = jogo.turno === "X" ? "O" : "X";
        const proximo = jogo.turno === "X" ? jogo.jogadorX : jogo.jogadorO;
        yield pico.sendMessage(from, {
            text: renderTabuleiro(jogo.tabuleiro) + `\nTurno: @${proximo.split("@")[0]} (${jogo.turno})`,
            contextInfo: { mentionedJid: [proximo] }
        });
    });
}
