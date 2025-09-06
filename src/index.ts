// src/index.ts

import "module-alias/register";
import dotenv from "dotenv";

dotenv.config();

import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";

import {log} from "@utils/Logger";
import axios from "axios";
import {classificacoesDfi, updateClassificacaoDfi} from "@utils/DfiUtils";

const app = new Koa();
const router = new Router();

type classificacaoDfiType = { status: 0 | 1, estabelecimento: string, recurso: string, fake: boolean, timeOut: number }

// GET: classification of machines
router.get("/proxy/integracao-metris/v1/teste/classificacao-maquina", async (ctx) => {
    const {codigoRecurso} = ctx.query;

    if (codigoRecurso && codigoRecurso !== "all") {
        ctx.body = classificacoesDfi.filter(
            (c) => c.recurso === codigoRecurso.toString()
        );
        return;
    }
    ctx.body = classificacoesDfi;
});

// POST: atualizar status da máquina
router.post("/proxy/integracao-metris/v1/teste/status-maquina", async (ctx) => {
    const {status, estabelecimento, recurso, fake, timeOut} = ctx.request.body as classificacaoDfiType;

    if (!recurso || status === undefined) {
        ctx.status = 400;
        ctx.body = {error: "Parâmetros inválidos"};
        return;
    }

    // Atualiza status da máquina
    updateClassificacaoDfi(recurso, status);

    ctx.body = {
        message: "Status atualizado com sucesso",
        recurso,
        novoStatus: status,
        fake,
        timeOut,
        estabelecimento
    };
});

// Middleware to connect the requests
app.use(async (ctx, next) => {
    log("info", `Request received: '${ctx.method}' '${ctx.path}'`);
    await next();
});

// Route the Proxy
router.all(`/proxy/*id`, async (ctx) => {
    const path = ctx.params.id;
    const fullUrl = `${process.env.API_URL}/${path}`;

    log("info", `Proxying request to: ${fullUrl}`);

    try {
        const requestTimeout = process.env.REQUEST_TIMEOUT as unknown as number;
        let response;

        const config = {
            timeout: requestTimeout || 10000,
            params: ctx.query,
            data: ctx.request.body,
            headers: ctx.headers
        };

        switch (ctx.method.toUpperCase()) {
            case "GET":
                response = await axios.get(fullUrl, config);
                break;
            case "POST":
                response = await axios.post(fullUrl, config.data, config);
                break;
            case "PUT":
                response = await axios.put(fullUrl, config.data, config);
                break;
            case "DELETE":
                response = await axios.delete(fullUrl, config);
                break;
            default:
                ctx.status = 405;
                ctx.body = "Method Not Allowed";
                return;
        }

        // Passes on the status and cup of the Real API response
        ctx.status = response.status;
        ctx.body = response.data;
    } catch (error: any) {
        log("error", "Error proxying request: " + error.message);

        if (axios.isAxiosError(error) && error.code === "ECONNABORTED") {
            ctx.status = 504;
            ctx.body = "The request to the external API took a long time and was canceled.";
        } else if (error.response) {
            ctx.status = error.response.status;
            ctx.body = error.response.data;
        } else {
            ctx.status = 500;
            ctx.body = "Error proxying internal proxy: " + error.message;
        }
    }
});

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 3000;

app.listen(port, () => {
    log("info", `Proxy server running in port 'localhost:${port}'`);
});