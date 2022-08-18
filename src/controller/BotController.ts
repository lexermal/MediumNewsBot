import { Context, Telegraf } from "telegraf";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import Log from "../_old/utils/Logger";

type MessageFunction = (chatId: number, additionalSendText: string) => Promise<string> | string;

const log = Log.getInstance();

class _BotController {
    bot: Telegraf<Context>;

    constructor() {
        this.bot = new Telegraf(process.env.TELEGRAF_TOKEN || "");
    }

    getBot() {
        return this.bot;
    }

    setWelcomeMessage(fnc: MessageFunction) {
        this.addListener("start", false, async (chatId, additionalText) => {
            log.info(`User ${chatId} joined the bot.`);

            return await fnc(chatId, additionalText);
        });
    }

    setHelpMessage(fnc: MessageFunction) {
        this.addListener("help", false, async (chatId, additionalText) => {
            log.info(`User ${chatId} requested the help message.`);

            return await fnc(chatId, additionalText);
        });
    }

    addListener(command: string, anyFollowingCharacters: boolean, fnc: MessageFunction, messageOptions?: ExtraReplyMessage) {
        let listener = new RegExp("/" + command);

        if (anyFollowingCharacters) {
            listener = new RegExp("/" + command + " (.+)");
        }

        this.bot.hears(listener, async (msg) => {
            const chatId = msg.message!.chat.id;
            const additionalText = (msg.match![1]).toString().trim();

            msg.replyWithMarkdown(await fnc(chatId, additionalText), messageOptions);
        });
    }

    launch() {
        this.bot.launch();
    }
}

const BotController = new _BotController();

export default BotController;
