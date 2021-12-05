import "reflect-metadata";
import Log from './Logger';
import Telegraf, { Extra } from 'telegraf'
import { Connection, createConnection } from 'typeorm';
import { sendNewArticles } from './utils/ArticleSender';
import { fetchNewArticles } from './utils/ArticleFetcher';
import { getSource, isValidHttpUrl } from "./utils/SourceTypeAnalyser";
import { addSource, getSourceList } from "./utils/SourceHandler";
import { Source, SourceType } from './entity/Source';
import { URL } from "url";
import { Content } from "./content/Content";

const bot = new Telegraf(process.env.TELEGRAF_TOKEN || "")
const log = Log.getInstance();


async function startBot(con: Connection) {

    bot.hears(/\/add (.+)/, async (msg) => {
        const url = msg.match![1];
        const chatID = msg.message!.chat.id;

        if (!isValidHttpUrl(url)) {
            msg.replyWithMarkdown("The provided url is not valid.");
            return;
        }

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

        msg.replyWithMarkdown(`*${urlPart}* of type *${sourceType}* ${Content.added}`);
    })

    bot.hears(/\/add/, (msg) => msg.replyWithMarkdown(Content.add, Extra.webPreview(false)));

    bot.hears(/\/list/, async (msg) => {
        const chatId = msg.message!.chat.id;

        let sourceList = await getFormattedSourceList(await getSourceList(con, chatId))

        if (sourceList.length === 0) {
            sourceList = "No sources are in your list.";
        }

        msg.replyWithMarkdown(`*Your medium sources:*\r\n\r\n${sourceList}`);
    })

    bot.hears(/\/remove (.+)/, async (msg) => {
        const chatId = msg.message!.chat.id;
        const removeSourceId = Number((msg.match![1]).toString().trim());

        if (Number.isNaN(removeSourceId)) {
            log.debug(`The user ${chatId} tried to delete a source with the invalid id '${removeSourceId}'.`)
            msg.replyWithMarkdown("The privided id is no number.");
            return;
        }

        const sources = await getSourceList(con, chatId);

        if (removeSourceId < 1 || removeSourceId > sources.length) {
            log.debug(`The user ${chatId} tried to delete a source with an id that is not in the allowed range: '${removeSourceId}'.`)
            msg.replyWithMarkdown(`The id ${removeSourceId} was not found.`);
            return;
        }

        const sourceToBeRemoved = sources[removeSourceId - 1];
        const sourceName = sourceToBeRemoved.urlPart1;

        con.getRepository(Source).remove(sourceToBeRemoved);
        msg.replyWithMarkdown(`*${sourceName}* was successfully removed.`);
    })

    bot.hears(/\/remove/, async (msg) => {
        const chatId = msg.message!.chat.id;
        const sources = await getSourceList(con, chatId);

        let sourceList = getFormattedSourceList(sources)
        if (sourceList.length === 0) {
            sourceList = "No sources are in your list.";
        }

        msg.replyWithMarkdown(Content.remove + `\r\n\r\n\r\n*Your medium sources:*\r\n\r\n${sourceList}`);
    });

    bot.hears(/\/start/, (msg) => msg.replyWithMarkdown(Content.start))

    bot.hears(/\/help/, (msg) => msg.replyWithMarkdown(Content.help))

    bot.launch();

    log.info("Successfully started the telegram bot!");
    return con;
}

function getFormattedSourceList(sources: Source[]) {
    return sources.map((source, index) => {
        let url = "https://medium.com/" + source.urlPart1;

        if (source.type === SourceType.DOMAIN) {
            url = source.urlPart1;
        } else if (source.type === SourceType.TAG) {
            url = "https://medium.com/tag/" + source.urlPart1;
        }

        return `*${index + 1}*: [${source.urlPart1}](${url})`;
    }).join("\r\n");
}


log.info("Starting the telegram bot.");

createConnection({
    type: "sqlite",
    database: __dirname + '/../db/database.sqlite',
    entities: [__dirname + '/entity/**/*.ts'],
    synchronize: true,
}).then(startBot).then(async con => {
    log.info("Starting to fetch new articles and send out unread ones.")

    const updateDuration = 5; //minutes

    fetchNewArticles(con, updateDuration);
    sendNewArticles(bot, con, updateDuration);
})