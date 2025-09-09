"use strict";
// src/utils/DfiUtils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.atualizarStatusMaquina = exports.classificacoesDfi = exports.motivosDeParada = void 0;
// Apenas os motivos que um operador pode classificar (para a simulação escolher)
exports.motivosDeParada = [
    { codigo: 1, descricao: "Aguardando Programação", corStatus: "#FFFF00" },
    { codigo: 2, descricao: "Ajuste de Máquina", corStatus: "#00FFFF" },
    { codigo: 3, descricao: "Manutenção Corretiva", corStatus: "#FF0000" },
    { codigo: 4, descricao: "Manutenção Preventiva", corStatus: "#FFC000" },
    { codigo: 5, descricao: "Setup de Máquina", corStatus: "#203764" },
    { codigo: 6, descricao: "Teste/Limpeza", corStatus: "#4472C4" },
    { codigo: 7, descricao: "Troca de Urdume/Passagem", corStatus: "#00B0F0" }
];
// Estrutura inicial das máquinas, agora usando seus códigos
exports.classificacoesDfi = [
    {
        recurso: "LOOM01",
        status: 0, // Parado
        aguardandoClassificacao: true,
    },
    {
        recurso: "LOOM02",
        status: 1,
        codigo: 8,
        descricao: "MÁQUINA OPERANDO",
        aguardandoClassificacao: false,
        corStatus: "#007C38"
    },
    {
        recurso: "LOOM03",
        status: 0,
        codigo: 5,
        descricao: "Setup de Máquina",
        aguardandoClassificacao: false,
        corStatus: "#203764"
    },
    {
        recurso: "LOOM04",
        status: 0, // Parado
        aguardandoClassificacao: true,
    },
    {
        recurso: "LOOM05",
        status: 0, // Parado
        aguardandoClassificacao: true,
    },
    {
        recurso: "LOOM06",
        status: 0, // Parado
        aguardandoClassificacao: true,
    },
    {
        recurso: "LOOM07",
        status: 0, // Parado
        aguardandoClassificacao: true,
    },
    {
        recurso: "LOOM10",
        status: 0, // Parado
        aguardandoClassificacao: true,
    },
    {
        recurso: "LOOM13",
        status: 0, // Parado
        aguardandoClassificacao: true,
    },
    {
        recurso: "LOOM15",
        status: 0, // Parado
        aguardandoClassificacao: true,
    },
    {
        recurso: "LOOM20",
        status: 0, // Parado
        aguardandoClassificacao: true,
    }
];
// A função para atualizar o estado
const atualizarStatusMaquina = (recurso, atualizacoes) => {
    exports.classificacoesDfi = exports.classificacoesDfi.map((maquina) => maquina.recurso === recurso ? { ...maquina, ...atualizacoes } : maquina);
    console.log(`[DfiUtils] Máquina ${recurso} foi atualizada.`);
};
exports.atualizarStatusMaquina = atualizarStatusMaquina;
