// src/utils/DfiUtils.ts

// Apenas os motivos que um operador pode classificar (para a simulação escolher)
export const motivosDeParada = [
    {codigo: 1, descricao: "Aguardando Programação", corStatus: "#FFFF00"},
    {codigo: 2, descricao: "Ajuste de Máquina", corStatus: "#00FFFF"},
    {codigo: 3, descricao: "Manutenção Corretiva", corStatus: "#FF0000"},
    {codigo: 4, descricao: "Manutenção Preventiva", corStatus: "#FFC000"},
    {codigo: 5, descricao: "Setup de Máquina", corStatus: "#203764"},
    {codigo: 6, descricao: "Teste/Limpeza", corStatus: "#4472C4"},
    {codigo: 7, descricao: "Troca de Urdume/Passagem", corStatus: "#00B0F0"}
];

// Estrutura inicial das máquinas, agora usando seus códigos
export let classificacoesDfi = [
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
];


// A função para atualizar o estado
export const atualizarStatusMaquina = (recurso: string, atualizacoes: object) => {
    classificacoesDfi = classificacoesDfi.map((maquina) =>
        maquina.recurso === recurso ? { ...maquina, ...atualizacoes } : maquina
    );
    console.log(`[DfiUtils] Máquina ${recurso} foi atualizada.`);
};