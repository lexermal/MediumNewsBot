import "reflect-metadata";
import Log from './Logger';
import Telegraf, { Extra } from 'telegraf'
import { Connection, createConnection } from 'typeorm';
import { getSourceLink, sendNewArticles } from './utils/ArticleSender';
import { fetchNewArticles } from './utils/ArticleFetcher';
import { getSource, isValidHttpUrl } from "./utils/SourceTypeAnalyser";
import { addSource, getSourceList } from "./utils/SourceHandler";
import { Source, SourceType } from './entity/Source';
import { URL } from "url";
import { Content } from "./content/Content";
import { TelegrafContext } from "telegraf/typings/context";
import { addTagBlocking, getBacklistItems } from "./utils/BlacklistHandler";
import { BlacklistedTag } from "./entity/BlacklistedTag";

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

function attachBlacklistHandling(bot: Telegraf<TelegrafContext>, con: Connection) {

    bot.hears(/\/block (.+)/, async (msg) => {
        const tags = msg.match![1].split(" ");
        const chatID = msg.message!.chat.id;

       const preparedTags= await addTagBlocking(con, chatID, tags);

        msg.replyWithMarkdown(`Successfully blocked the tag ${tags.length > 1 ? 'combination ' : ''} *${preparedTags.join(" ").replace(/\_/g, "\_")}*.\r\n` +
            `You will not receive articles containing these tags anymore.`);
    })

    bot.hears(/\/block/, (msg) => msg.replyWithMarkdown(Content.block, Extra.webPreview(false)));

    bot.hears(/\/unblock (.+)/, async (msg) => {
        const chatId = msg.message!.chat.id;
        const removeTagId = Number((msg.match![1]).toString().trim());

        const blockedTags = await getBacklistItems(con, chatId);

        if (!isValidId(msg, chatId, removeTagId, blockedTags.length)) {
            return;
        }

        const tagToBeRemoved = blockedTags[removeTagId - 1];
        const tagName = tagToBeRemoved.tags;

        con.getRepository(BlacklistedTag).remove(tagToBeRemoved);

        msg.replyWithMarkdown(`Tag *${tagName.join("* in combination with tag *").replace(/\_/g, "\\_")}* was successfully removed.`);
    })

    bot.hears(/\/blacklist/, async (msg) => {
        const chatId = msg.message!.chat.id;

        let sourceList = (await getBacklistItems(con, chatId))
            .map((blacklistedTag, index) => `*${index + 1}*: ${blacklistedTag.tags.join(" ")}`)
            .join("\r\n")
            .replace(/\_/g, "\\_");

        if (sourceList.length === 0) {
            sourceList = "No blocked tags in your list.";
        }

        msg.replyWithMarkdown(`*Your blocked tags:*\r\n\r\n${sourceList}`, Extra.webPreview(false));
    })

    bot.hears(/\/unblock/, (msg) => msg.replyWithMarkdown(Content.unblock, Extra.webPreview(false)));
}

function attachSourceHandling(bot: Telegraf<TelegrafContext>, con: Connection) {

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

    bot.hears(/\/remove (.+)/, async (msg) => {
        const chatId = msg.message!.chat.id;
        const removeSourceId = Number((msg.match![1]).toString().trim());

        const sources = await getSourceList(con, chatId);

        if (!isValidId(msg, chatId, removeSourceId, sources.length)) {
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

    bot.hears(/\/list/, async (msg) => {
        const chatId = msg.message!.chat.id;

        let sourceList = await getFormattedSourceList(await getSourceList(con, chatId))

        if (sourceList.length === 0) {
            sourceList = "No sources are in your list.";
        }

        msg.replyWithMarkdown(`*Your medium sources:*\r\n\r\n${sourceList}`, Extra.webPreview(false));
    })
}

function isValidId(msg: TelegrafContext, chatId: number, removeSourceId: number, maxIdIndex: number) {
    if (Number.isNaN(removeSourceId)) {
        log.debug(`The user ${chatId} tried to delete a source with the invalid id '${removeSourceId}'.`)
        msg.replyWithMarkdown("The privided id is no number.");
        return false;
    }

    if (removeSourceId < 1 || removeSourceId > maxIdIndex) {
        log.debug(`The user ${chatId} tried to delete a source with an id that is not in the allowed range: '${removeSourceId}'.`)
        msg.replyWithMarkdown(`The id ${removeSourceId} was not found.`);
        return false;
    }
    return true;
}

function getFormattedSourceList(sources: Source[]) {
    return sources
        .map((source, index) => `*${index + 1}*: ${getSourceLink(source)}`)
        .join("\r\n");
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