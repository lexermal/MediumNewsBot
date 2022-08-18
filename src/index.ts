import "reflect-metadata";
import BotController from "./controller/BotController";
import DatabaseController from "./controller/DatabaseController";
import { attachBlacklistListeners } from "./listeners/BlacklistListerner";
import { attachSourceListeners } from "./listeners/SourceListener";
import { Content } from "./_old/content/Content";
import Log from "./utils/Logger";
import ArticleController from "./controller/ArticleController";


Log.info("Starting Medium News bot.");

DatabaseController.initDB().then(() => {
    attachSourceListeners();
    attachBlacklistListeners();

    BotController.setWelcomeMessage(() => Content.start);

    BotController.setHelpMessage(() => Content.help);

    BotController.launch();

    Log.info("Successfully started Medium News bot!");


    Log.info("Starting to fetch new articles and send out unread ones.");

    const fetchingDuration = Number(process.env.FETCHING_DURATION || 5); //minutes
    const sendingDuration = Number(process.env.SENDING_DURATION || 6); //minutes

    ArticleController.startArticleFetching(fetchingDuration);

    ArticleController.startArticleSending(sendingDuration);
}).catch(e => {
    Log.error(e.message, e);
    process.exit(1);
});