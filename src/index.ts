import "reflect-metadata";
import { Telegraf } from "telegraf";
import { DataSource } from 'typeorm';
import { attachBlacklistHandling } from "./_old/bot/Blacklist";
import { attachSourceHandling } from "./_old/bot/Source";
import { Content } from "./_old/content/Content";
import { fetchNewArticles } from "./_old/utils/ArticleFetcher";
import { sendNewArticles } from "./_old/utils/ArticleSender";
import Log from "./_old/utils/Logger";

const bot = new Telegraf(process.env.TELEGRAF_TOKEN || "");
const log = Log.getInstance();


async function startBot(con: DataSource) {

    attachSourceHandling(bot, con);
    attachBlacklistHandling(bot, con);

    bot.hears(/\/start/, (msg) => {
        const chatId = msg.message!.chat.id;

        log.info(`The user ${chatId} joined the bot.`);

        msg.replyWithMarkdown(Content.start);
    });


    bot.hears(/\/help/, (msg) => msg.replyWithMarkdown(Content.help));

    bot.launch();

    log.info("Successfully started the telegram bot!");
    return con;
}


log.info("Starting the telegram bot.");

new DataSource({
    type: "sqlite",
    database: __dirname + '/../db/database.sqlite',
    entities: [__dirname + '/entity/**/*.ts'],
    synchronize: true,
}).initialize().then(startBot).then(async con => {
    log.info("Starting to fetch new articles and send out unread ones.");

    const fetchingDuration = Number(process.env.FETCHING_DURATION || 5); //minutes
    const sendingDuration = Number(process.env.SENDING_DURATION || 6); //minutes

    fetchNewArticles(con, fetchingDuration);
    sendNewArticles(bot, con, sendingDuration);
}).catch(e => {
    log.error(e.message, e);
    process.exit(1);
});