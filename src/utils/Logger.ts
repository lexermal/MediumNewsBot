import { TransformableInfo } from "logform";
import { createLogger, format, Logger, transports } from "winston";

class _Log {
    private logger: Logger;

    constructor() {
        this.logger = createLogger({
            level: "debug",
            transports: [],
            format: format.combine(
                format.colorize(),
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                format.align(),
                format.printf(this.format)
            ),
        });

        this.logger.add(new transports.Console());
    }

    private format(info: TransformableInfo): string {
        const { timestamp, level, message, file, ...args } = info;
        const formatted = Object.keys(args).length > 0 ? JSON.stringify(args) : "";

        const basicInfo = `${timestamp} [${level}] ${file}:`.padEnd(50);

        return `${basicInfo} ${message} ${formatted}`;
    }

    private getSourceFile(): string {
        const { stack } = new Error();

        if (stack) {
            const source = stack.split("at ")[3];
            const start = source.lastIndexOf("/") + 1;

            return source.substr(start, source.indexOf(":") - start - 3);
        }
        return "";
    }

    public debug(message: string, ...data: any[]): void {
        this.logger.debug(message, Object.assign(data, { file: this.getSourceFile() }));
    }

    public info(message: string, ...data: any[]): void {
        this.logger.info(message, Object.assign(data, { file: this.getSourceFile() }));
    }

    public warn(message: string, ...data: any[]): void {
        this.logger.warn(message, Object.assign(data, { file: this.getSourceFile() }));
    }

    public error(message: string, ...data: any[]): void {
        this.logger.error(message, Object.assign(data, { file: this.getSourceFile() }));
    }
}

const Log = new _Log();

export default Log;

