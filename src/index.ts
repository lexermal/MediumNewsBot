import "reflect-metadata";
import { DataSource } from 'typeorm';
import BotController from "./controller/BotController";
import DatabaseController from "./controller/DatabaseController";
import { attachBlacklistHandling } from "./_old/bot/Blacklist";
import { attachSourceHandling } from "./_old/bot/Source";
import { Content } from "./_old/content/Content";
import { fetchNewArticles } from "./_old/utils/ArticleFetcher";
import { sendNewArticles } from "./_old/utils/ArticleSender";
import Log from "./_old/utils/Logger";

const bot = BotController.getBot();

async function startBot(con: DataSource) {
    attachSourceHandling();
    attachBlacklistHandling(con);

    BotController.setWelcomeMessage(() => Content.start);

    BotController.setHelpMessage(() => Content.help);

    BotController.launch();

    Log.info("Successfully started the telegram bot!");
    return con;
}


Log.info("Starting the telegram bot.");

DatabaseController.initDB().then(() => {
    return DatabaseController.getConnection();
}).then(startBot).then(async con => {

    Log.info("Starting to fetch new articles and send out unread ones.");

    const fetchingDuration = Number(process.env.FETCHING_DURATION || 5); //minutes
    const sendingDuration = Number(process.env.SENDING_DURATION || 6); //minutes

    fetchNewArticles(fetchingDuration);
    sendNewArticles(bot, con, sendingDuration);
}).catch(e => {
    Log.error(e.message, e);
    process.exit(1);
});