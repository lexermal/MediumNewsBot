import { URL } from "url";
import { Content } from "../content/Content";
import { Source } from "../../entity/Source";
import { getSourceLink } from "../utils/ArticleSender";
import { validURL, getSource } from "../utils/SourceTypeAnalyser";
import { Fetcher } from "../utils/Fetcher";
import SourceController from "../../controller/SourceController";
import BotController from "../../controller/BotController";

export function attachSourceHandling() {
    const sc = SourceController;

    BotController.addListener("add", true, async (chatID, url) => {
        if (!validURL(url)) {
            return "The provided url is not valid.";
        }

        const [sourceType, urlPart] = getSource(new URL(url));

        if (!await Fetcher.isFetchable(Fetcher.getURL(sourceType, [urlPart]))) {
            return `The url should be of type ${sourceType} but the RSS feed was not fetchable.` +
                ` Are you sure you provided a url to a blog that uses the Medium.com CMS?`;
        }

        sc.addSource(chatID, sourceType, urlPart);

        return `*${urlPart}* of type *${sourceType}* ${Content.added}`;
    });

    BotController.addListener("add", false, () => Content.add, { disablePreview: true });

    BotController.addListener("remove", true, (chatId, removeSourceId) => {

        return sc.removeSource(chatId, removeSourceId).then(sourceName => {
            return `*${sourceName}* was successfully removed.`;
        }).catch(error => {
            return error.message;
        });
    });

    BotController.addListener("remove", false, async (chatId) => {
        const sourceList = getSourceList(chatId);

        return `${Content.remove}\r\n\r\n\r\n${sourceList}`;
    }, { disablePreview: true });

    BotController.addListener("list", false, async (chatId) => {
        return getSourceList(chatId);
    }, { disablePreview: true });
}

async function getSourceList(chatId: number) {
    let sources = getFormattedList(await SourceController.getSources(chatId));

    if (sources.length === 0) {
        sources = "No sources are in your list.";
    }

    return `*Your medium sources:*\r\n\r\n${sources}`;
}

function getFormattedList(sources: Source[]) {
    return sources
        .map((source, index) => `*${index + 1}*: [${source.urlPart1}](${getSourceLink(source)})`)
        .join("\r\n");
}