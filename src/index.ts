import "reflect-metadata";
import Log from './Logger';
import Telegraf from 'telegraf'
import Content from './content/en.json';
import { Connection, createConnection } from 'typeorm';
import { sendNewArticles } from './utils/ArticleSender';
import { fetchNewArticles } from './utils/ArticleFetcher';
import { getSource } from "./utils/SourceTypeAnalyser";
import { addSource } from "./utils/SourceHandler";
import { SourceType } from './entity/Source';
import { URL } from "url";

const bot = new Telegraf(process.env.TELEGRAF_TOKEN || "")
const log = Log.getInstance();


async function startBot(con: Connection) {
    bot.hears(/\/start/, (msg) => msg.replyWithMarkdown(Content.start))

    bot.hears(/\/help/, (msg) => msg.replyWithMarkdown(Content.help))

    bot.hears(/\/user (.+)/, (msg) => {
        const urlPart = msg.match![1];
        const chatID = msg.message!.chat.id;

        addSource(con, SourceType.USER, [urlPart], chatID || 0);

        msg.replyWithMarkdown(`*${urlPart}* ${Content.sucessfullyAdded}`);
    })

    bot.hears(/\/user/, (msg) => msg.replyWithMarkdown(Content.user))

    bot.hears(/\/custom (.+)/, (msg) => {
        const urlPart = msg.match![1];
        const chatID = msg.message!.chat.id;

        addSource(con, SourceType.DOMAIN, [urlPart], chatID || 0);

        msg.replyWithMarkdown(`*${urlPart}* ${Content.sucessfullyAdded}`);
    })

    bot.hears(/\/custom/, (msg) => msg.replyWithMarkdown(Content.custom))

    bot.hears(/\/tag (.+)/, (msg) => {
        const urlPart = msg.match![1];
        const chatID = msg.message!.chat.id;

        addSource(con, SourceType.TAG, [urlPart], chatID || 0);

        msg.replyWithMarkdown(`*${urlPart}* ${Content.sucessfullyAdded}`);
    })

    bot.hears(/\/tag/, (msg) => msg.replyWithMarkdown(Content.tag))

    bot.hears(/\/tagged (.+)/, (msg) => {
        const elements = msg.match![1].split(' ');
        const chatID = msg.message!.chat.id;

        addSource(con, SourceType.TAGGED, elements, chatID || 0);

        msg.replyWithMarkdown(`*${elements.join(" ")}* ${Content.sucessfullyAdded}`);

    })

    bot.hears(/\/tagged/, (msg) => msg.replyWithMarkdown(Content.tagged))

    bot.hears(/\/publication (.+)/, async (msg) => {
        const urlPart = msg.match![1];
        const chatID = msg.message!.chat.id;

        addSource(con, SourceType.PUBLICATION, [urlPart], chatID || 0);

        msg.replyWithMarkdown(`*${urlPart}* ${Content.sucessfullyAdded}`);
    })

    bot.hears(/\/publication/, (msg) => msg.replyWithMarkdown(Content.publication))

    bot.hears(/\/add (.+)/, async (msg) => {
        const url = msg.match![1];
        const chatID = msg.message!.chat.id;

        const [sourceType, urlPart] = getSource(new URL(url))

        switch (sourceType) {
            case SourceType.DOMAIN:
                addSource(con, SourceType.DOMAIN, [urlPart], chatID || 0);
                break;
            case SourceType.TAG:
                addSource(con, SourceType.TAG, [urlPart], chatID || 0);
                break;
            case SourceType.USER:
                addSource(con, SourceType.USER, [urlPart], chatID || 0);
                break;
            case SourceType.PUBLICATION:
                addSource(con, SourceType.PUBLICATION, [urlPart], chatID || 0);
                break;
            default:
                throw new Error(`Unknown sourcetype '${sourceType}'.`)
        }

        msg.replyWithMarkdown(`*${urlPart}* of type *${sourceType}* ${Content.sucessfullyAdded}`);
    })

    bot.hears(/\/add/, (msg) => msg.replyWithMarkdown(Content.publication));

    bot.launch();

    log.info("Successfully started the telegram bot!");
    return con;
}


log.info("Starting the telegram bot.");

createConnection().then(startBot).then(async con => {
    log.info("Starting to fetch new articles and send out unread ones.")
    fetchNewArticles(con);
    sendNewArticles(bot, con);
}).catch(error => log.error(error,(error as Error).stack));