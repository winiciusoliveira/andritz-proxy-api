"use strict";
// src/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const dotenv_1 = __importDefault(require("dotenv"));
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const Logger_1 = require("@utils/Logger");
const axios_1 = __importDefault(require("axios"));
const DfiUtils_1 = require("@utils/DfiUtils");
dotenv_1.default.config();
const app = new koa_1.default();
const router = new koa_router_1.default();
// Objeto para armazenar os timeouts agendados por recurso
const timeoutsAgendados = {};
// GET: classification of machines
router.get("/proxy/integracao-metris/v1/teste/classificacao-maquina", async (ctx) => {
    const { codigoRecurso } = ctx.query;
    if (codigoRecurso && codigoRecurso !== "all") {
        ctx.body = DfiUtils_1.classificacoesDfi.filter((c) => c.recurso === codigoRecurso.toString());
        return;
    }
    ctx.body = DfiUtils_1.classificacoesDfi;
});
// POST: aqui faremos a mágica (VERSÃO CORRIGIDA)
router.post("/proxy/integracao-metris/v1/teste/status-maquina", async (ctx) => {
    const { status, estabelecimento, recurso, fake, timeOut } = ctx.request.body;
    if (!recurso || status === undefined) {
        ctx.status = 400;
        ctx.body = { error: "Parâmetros inválidos" };
        return;
    }
    // 1. CANCELA QUALQUER TIMEOUT PENDENTE PARA ESTA MÁQUINA
    // Isso evita o problema de um agendamento antigo sobrescrever um novo estado.
    if (timeoutsAgendados[recurso.toUpperCase()]) {
        clearTimeout(timeoutsAgendados[recurso.toUpperCase()]);
        (0, Logger_1.log)('info', `[SISTEMA] Timeout anterior para ${recurso.toUpperCase()} foi cancelado.`);
        delete timeoutsAgendados[recurso.toUpperCase()];
    }
    // 2. AVALIA O NOVO STATUS
    if (status === 0) {
        // A máquina vai para o estado "Aguardando Classificação" imediatamente.
        (0, Logger_1.log)('info', `[SISTEMA] Colocando ${recurso.toUpperCase()} em estado de parada (aguardando classificação).`);
        (0, DfiUtils_1.atualizarStatusMaquina)(recurso.toUpperCase(), {
            status: 0,
            aguardandoClassificacao: true,
            // Limpa dados antigos de classificação para um estado "limpo"
            codigo: undefined,
            descricao: undefined,
            corStatus: undefined,
        });
        // Se um timeOut foi informado, agenda a classificação automática.
        if (timeOut && timeOut > 0) {
            (0, Logger_1.log)('info', `[SIMULAÇÃO] Agendando classificação para ${recurso.toUpperCase()} em ${timeOut} segundos.`);
            timeoutsAgendados[recurso.toUpperCase()] = setTimeout(() => {
                (0, Logger_1.log)('info', `[SIMULAÇÃO] Timeout de ${timeOut}s para ${recurso} finalizado. Classificando...`);
                const indiceAleatorio = Math.floor(Math.random() * DfiUtils_1.motivosDeParada.length);
                const motivoEscolhido = DfiUtils_1.motivosDeParada[indiceAleatorio];
                const classificacaoFinal = {
                    aguardandoClassificacao: false,
                    codigo: motivoEscolhido.codigo,
                    descricao: motivoEscolhido.descricao,
                    corStatus: motivoEscolhido.corStatus
                };
                (0, DfiUtils_1.atualizarStatusMaquina)(recurso.toUpperCase(), classificacaoFinal);
                delete timeoutsAgendados[recurso.toUpperCase()]; // Limpa o timeout após a execução
            }, timeOut * 1000);
        }
    }
    else if (status === 1) {
        // Lógica para ligar a máquina (já estava correta)
        (0, Logger_1.log)('info', `[SISTEMA] Ligando a máquina ${recurso.toUpperCase()}.`);
        (0, DfiUtils_1.atualizarStatusMaquina)(recurso.toUpperCase(), {
            status: 1,
            codigo: 8,
            descricao: "MÁQUINA OPERANDO",
            aguardandoClassificacao: false,
            corStatus: "#007C38"
        });
    }
    ctx.body = {
        message: "Status recebido e processo atualizado com sucesso",
        recurso,
        status,
        timeOut
    };
});
// Middleware to connect the requests
app.use(async (ctx, next) => {
    (0, Logger_1.log)("info", `Request received: '${ctx.method}' '${ctx.path}'`);
    await next();
});
// Route the Proxy
router.all(`/proxy/*id`, async (ctx) => {
    const path = ctx.params.id;
    const fullUrl = `${process.env.API_URL}/${path}`;
    (0, Logger_1.log)("info", `Proxying request to: ${fullUrl}`);
    try {
        const requestTimeout = process.env.REQUEST_TIMEOUT;
        let response;
        const config = {
            timeout: requestTimeout || 10000,
            params: ctx.query,
            data: ctx.request.body,
            headers: ctx.headers
        };
        switch (ctx.method.toUpperCase()) {
            case "GET":
                response = await axios_1.default.get(fullUrl, config);
                break;
            case "POST":
                response = await axios_1.default.post(fullUrl, config.data, config);
                break;
            case "PUT":
                response = await axios_1.default.put(fullUrl, config.data, config);
                break;
            case "DELETE":
                response = await axios_1.default.delete(fullUrl, config);
                break;
            default:
                ctx.status = 405;
                ctx.body = "Method Not Allowed";
                return;
        }
        // Passes on the status and cup of the Real API response
        ctx.status = response.status;
        ctx.body = response.data;
    }
    catch (error) {
        (0, Logger_1.log)("error", "Error proxying request: " + error.message);
        if (axios_1.default.isAxiosError(error) && error.code === "ECONNABORTED") {
            ctx.status = 504;
            ctx.body = "The request to the external API took a long time and was canceled.";
        }
        else if (error.response) {
            ctx.status = error.response.status;
            ctx.body = error.response.data;
        }
        else {
            ctx.status = 500;
            ctx.body = "Error proxying internal proxy: " + error.message;
        }
    }
});
app.use((0, koa_bodyparser_1.default)());
app.use(router.routes()).use(router.allowedMethods());
const port = process.env.PORT || 3000;
app.listen(port, () => {
    (0, Logger_1.log)("info", `Proxy server running in port 'localhost:${port}'`);
});
