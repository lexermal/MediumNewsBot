import { Context, Telegraf } from "telegraf";
import Log from "../utils/Logger";

type MessageFunction = (chatId: number, additionalSendText: string) => Promise<string> | string;
interface MessageOptions {
    disablePreview: boolean;
}

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
            Log.info(`User ${chatId} joined the bot.`);

            return await fnc(chatId, additionalText);
        });
    }

    setHelpMessage(fnc: MessageFunction) {
        this.addListener("help", false, async (chatId, additionalText) => {
            Log.info(`User ${chatId} requested the help message.`);

            return await fnc(chatId, additionalText);
        });
    }

    addListener(command: string, anyFollowingCharacters: boolean, fnc: MessageFunction, messageOptions?: MessageOptions) {
        let listener = new RegExp("/" + command);

        if (anyFollowingCharacters) {
            listener = new RegExp("/" + command + " (.+)");
        }

        this.bot.hears(listener, async (msg) => {
            const chatId = msg.message!.chat.id;
            const additionalText = (msg.match![1]).toString().trim();

            msg.replyWithMarkdown(await fnc(chatId, additionalText), { disable_web_page_preview: messageOptions?.disablePreview });
        });
    }

    launch() {
        this.bot.launch();
    }
}

const BotController = new _BotController();

export default BotController;
