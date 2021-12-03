import path from "path";
import { TransformableInfo } from "logform";
import { createLogger, format, Logger, transports } from "winston";

export default class Log {
    private static instance: Log;
    private logger: Logger;

    private constructor() {

        this.logger = createLogger({
            level: "debug",
            format: format.combine(
                format.colorize(),
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                format.align(),
                format.printf(Log.format)
            ),
            transports: []
        });

        this.logger.add(new transports.Console());
    }

    public static getInstance(): Log {
        if (!this.instance) {
            this.instance = new this();
        }
        return this.instance;
    }

    private static format(info: TransformableInfo): string {
        const { timestamp, level, message, file, ...args } = info;
        const formatted = Object.keys(args).length > 0 ? JSON.stringify(args) : "";

        const basicInfo = `${timestamp} [${level}] ${file}:`.padEnd(50);

        return `${basicInfo} ${message} ${formatted}`;
    }

    private static getSourceFile(): string {
        const { stack } = new Error();

        if (stack) {
            const source = stack.split("at ")[3];
            const start = source.lastIndexOf("/") + 1;

            return source.substr(start, source.indexOf(":") - start - 3);
        }
        return "";
    }

    public debug(message: string, ...data: any[]): void {
        this.logger.debug(message, Object.assign(data, { file: Log.getSourceFile() }));
    }

    public info(message: string, ...data: any[]): void {
        this.logger.info(message, Object.assign(data, { file: Log.getSourceFile() }));
    }

    public warn(message: string, ...data: any[]): void {
        this.logger.warn(message, Object.assign(data, { file: Log.getSourceFile() }));
    }

    public error(message: string, ...data: any[]): void {
        this.logger.error(message, Object.assign(data, { file: Log.getSourceFile() }));
    }
}
