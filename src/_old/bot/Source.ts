import { URL } from "url";
import { Content } from "../content/Content";
import { Source } from "../entity/Source";
import { getSourceLink } from "../utils/ArticleSender";
import { isValidHttpUrl, getSource } from "../utils/SourceTypeAnalyser";
import { Fetcher } from "../utils/Fetcher";
import { Telegraf, Context } from "telegraf";
import SourceController from "../../controller/SourceController";

export function attachSourceHandling(bot: Telegraf<Context>) {
    const sc = new SourceController();

    bot.hears(/\/add (.+)/, async (msg) => {
        const url = msg.match![1];
        const chatID = msg.message!.chat.id;

        if (!isValidHttpUrl(url)) {
            msg.replyWithMarkdown("The provided url is not valid.");
            return;
        }

        const [sourceType, urlPart] = getSource(new URL(url));

        if (!await Fetcher.isFetchable(Fetcher.getURL(sourceType, [urlPart]))) {
            msg.replyWithMarkdown(`The url should be of type ${sourceType} but the RSS feed was not fetchable.` +
                ` Are you sure you provided a url to a blog that uses the Medium.com CMS?`);
            return;
        }

        sc.addSource(chatID, sourceType, urlPart);

        msg.replyWithMarkdown(`*${urlPart}* of type *${sourceType}* ${Content.added}`);
    });

    bot.hears(/\/add/, (msg) => msg.replyWithMarkdown(Content.add, { disable_web_page_preview: false }));

    bot.hears(/\/remove (.+)/, async (msg) => {
        const chatId = msg.message!.chat.id;
        const removeSourceId = (msg.match![1]).toString().trim();

        sc.removeSource(chatId, removeSourceId).then(sourceName => {
            msg.replyWithMarkdown(`*${sourceName}* was successfully removed.`);
        }).catch(error => {
            msg.replyWithMarkdown(error.message);
        });
    });

    bot.hears(/\/remove/, async (msg) => {
        const chatId = msg.message!.chat.id;
        const sources = await sc.getSources(chatId);

        let sourceList = getFormattedSourceList(sources);
        if (sourceList.length === 0) {
            sourceList = "No sources are in your list.";
        }

        msg.replyWithMarkdown(Content.remove + `\r\n\r\n\r\n*Your medium sources:*\r\n\r\n${sourceList}`);
    });

    bot.hears(/\/list/, async (msg) => {
        const chatId = msg.message!.chat.id;

        let sourceList = await getFormattedSourceList(await sc.getSources(chatId));

        if (sourceList.length === 0) {
            sourceList = "No sources are in your list.";
        }

        msg.replyWithMarkdown(`*Your medium sources:*\r\n\r\n${sourceList}`, { disable_web_page_preview: false });
    });
}

function getFormattedSourceList(sources: Source[]) {
    return sources
        .map((source, index) => `*${index + 1}*: [${source.urlPart1}](${getSourceLink(source)})`)
        .join("\r\n");
}