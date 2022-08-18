import { Context, Telegraf } from "telegraf";
import Log from "../_old/utils/Logger";

const log = Log.getInstance();

class _BotController {
    bot: Telegraf<Context>;

    constructor() {
        this.bot = new Telegraf(process.env.TELEGRAF_TOKEN || "");
    }

    getBot() {
        return this.bot;
    }

    setWelcomeMessage(fnc: (chatId: number) => string) {
        this.bot.hears(/\/start/, (msg) => {
            const chatId = msg.message!.chat.id;

            log.info(`User ${chatId} joined the bot.`);

            msg.replyWithMarkdown(fnc(chatId));
        });
    }

    setHelpMessage(fnc: (chatId: number) => string) {
        this.bot.hears(/\/help/, (msg) => {
            const chatId = msg.message!.chat.id;

            log.info(`User ${chatId} requested the help message.`);

            msg.replyWithMarkdown(fnc(chatId));
        });
    }

    launch() {
        this.bot.launch();
    }
}

const BotController = new _BotController();

export default BotController;
