// src/utils/DfiUtils.ts

export let classificacoesDfi = [
    {
        recurso: "LOOM01",
        status: 0,
        codigo: 9,
        descricao: "MAQUINA PARADA",
        aguardandoClassificacao: false
    },
    {
        recurso: "LOOM02",
        status: 1,
        codigo: 8,
        descricao: "MAQUINA OPERANDO",
        aguardandoClassificacao: false
    },
    {
        recurso: "LOOM03",
        status: 1,
        codigo: 8,
        descricao: "MAQUINA OPERANDO",
        aguardandoClassificacao: false
    },
];


// Update ClassificacaoDfi
export const updateClassificacaoDfi = (recurso: string, status: number) => {
    classificacoesDfi = classificacoesDfi.map((c) =>
        c.recurso === recurso ? {...c, status, descricao: status === 1 ? "MAQUINA OPERANDO" : "MAQUINA PARADA"} : c);
};