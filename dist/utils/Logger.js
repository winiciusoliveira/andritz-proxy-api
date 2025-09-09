"use strict";
// src/utils/Logger.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = log;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const getLogTimestamp = () => {
    const now = new Date();
    return now.toISOString().split("T")[0]; // YYYY-MM-DD format
};
const logTimestamp = getLogTimestamp();
/**
 * Configurações do logger do winston
 *
 * 5242880 bytes = 5MB
 * maxFiles = 5 - Creating 5 log files per day
 */
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
        const metaString = Object.keys(metadata).length > 0 ? `${JSON.stringify(metadata)}` : "";
        return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString ? ` ${metaString}` : ""}${stack ? "\n" + stack : ""}`;
    })),
    transports: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(`logs/${logTimestamp}`, `error-${logTimestamp}.log`),
            level: "error",
            maxsize: 5242880,
            maxFiles: 5,
        }),
        // Join all logs in one file
        new winston_1.default.transports.File({
            filename: path_1.default.join(`logs/${logTimestamp}`, `combined-${logTimestamp}.log`),
            maxsize: 5242880,
            maxFiles: 5,
        }),
        // Creating a console log transport
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(({ level, timestamp, message }) => {
                return `${timestamp} [${level}]: ${message}`;
            })),
        }),
    ],
});
function log(level, message, metadata) {
    try {
        logger[level](message, metadata || {});
    }
    catch (error) {
        throw new Error("[LOGGER-ERROR]: Error registering a new log");
    }
}
