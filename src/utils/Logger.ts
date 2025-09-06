// src/utils/Logger.ts

import winston, { Logger } from "winston";
import path from "path";
import { TransformableInfo } from "logform";

const getLogTimestamp: () => string = (): string => {
    const now = new Date();
    return now.toISOString().split("T")[0]; // YYYY-MM-DD format
};

const logTimestamp: string = getLogTimestamp();

/**
 * Configurações do logger do winston
 *
 * 5242880 bytes = 5MB
 * maxFiles = 5 - Creating 5 log files per day
 */
const logger: Logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ level, message, timestamp, stack, ...metadata }: TransformableInfo): string => {
            const metaString: string = Object.keys(metadata).length > 0 ? `${JSON.stringify(metadata)}` : "";
            
            return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString ? ` ${metaString}` : ""}${stack ? "\n" + stack : ""}`;
        }),
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(`logs/${logTimestamp}`, `error-${logTimestamp}.log`),
            level: "error",
            maxsize: 5242880,
            maxFiles: 5,
        }),
        // Join all logs in one file
        new winston.transports.File({
            filename: path.join(`logs/${logTimestamp}`, `combined-${logTimestamp}.log`),
            maxsize: 5242880,
            maxFiles: 5,
        }),
        // Creating a console log transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ level, timestamp, message }: TransformableInfo): string => {
                    return `${timestamp} [${level}]: ${message}`;
                }),
            ),
        }),
    ],
});

export function log(level: "info" | "warn" | "error" | "debug", message: string, metadata?: Record<string, unknown>): void {
    try {
        logger[level](message, metadata || {});
    } catch (error) {
        throw new Error("[LOGGER-ERROR]: Error registering a new log");
    }
}