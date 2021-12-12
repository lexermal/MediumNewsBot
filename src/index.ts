import "reflect-metadata";
import Log from './Logger';
import Telegraf from 'telegraf'
import { Connection, createConnection } from 'typeorm';
import { sendNewArticles } from './utils/ArticleSender';
import { fetchNewArticles } from './utils/ArticleFetcher';
import { Content } from "./content/Content";
import { attachBlacklistHandling } from "./bot/Blacklist";
import { attachSourceHandling } from "./bot/Source";

const bot = new Telegraf(process.env.TELEGRAF_TOKEN || "")
const log = Log.getInstance();


async function startBot(con: Connection) {

    attachSourceHandling(bot, con);
    attachBlacklistHandling(bot, con);

    bot.hears(/\/start/, (msg) => {
        const chatId = msg.message!.chat.id;

        log.info(`The user ${chatId} joined the bot.`);

        msg.replyWithMarkdown(Content.start);
    });


    bot.hears(/\/help/, (msg) => msg.replyWithMarkdown(Content.help))

    bot.launch();

    log.info("Successfully started the telegram bot!");
    return con;
}


log.info("Starting the telegram bot.");

createConnection({
    type: "sqlite",
    database: __dirname + '/../db/database.sqlite',
    entities: [__dirname + '/entity/**/*.ts'],
    synchronize: true,
}).then(startBot).then(async con => {
    log.info("Starting to fetch new articles and send out unread ones.")

    const updateDuration = Number(process.env.DURATION || 5); //minutes

    fetchNewArticles(con, updateDuration);
    sendNewArticles(bot, con, updateDuration);
}).catch(e => {
    log.error(e.message, e);
    process.exit(1);
})