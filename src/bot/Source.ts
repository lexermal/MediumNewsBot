import Telegraf, { Extra } from "telegraf";
import { TelegrafContext } from "telegraf/typings/context";
import { Connection } from "typeorm";
import { URL } from "url";
import { Content } from "../content/Content";
import { SourceType, Source } from "../entity/Source";
import Log from "../utils/Logger";
import { getSourceLink } from "../utils/ArticleSender";
import { isValidHttpUrl, getSource } from "../utils/SourceTypeAnalyser";
import { isValidId } from "./Utils";
import { addSource, getSourceList } from "../handler/SourceHandler";

export function attachSourceHandling(bot: Telegraf<TelegrafContext>, con: Connection) {

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

        if (!isValidId(msg, chatId, removeSourceId, sources.length, Log.getInstance())) {
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

function getFormattedSourceList(sources: Source[]) {
    return sources
        .map((source, index) => `*${index + 1}*: ${getSourceLink(source)}`)
        .join("\r\n");
}