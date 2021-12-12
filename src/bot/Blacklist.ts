import Telegraf, { Extra } from "telegraf";
import { TelegrafContext } from "telegraf/typings/context";
import { Connection } from "typeorm";
import { Content } from "../content/Content";
import { BlacklistedTag } from "../entity/BlacklistedTag";
import Log from "../utils/Logger";
import { addTagBlocking, getBacklistItems } from "../handler/BlacklistHandler";
import { isValidId } from "./Utils";

export function attachBlacklistHandling(bot: Telegraf<TelegrafContext>, con: Connection) {

    bot.hears(/\/block (.+)/, async (msg) => {
        const tags = msg.match![1].split(" ");
        const chatID = msg.message!.chat.id;

        const preparedTags = await addTagBlocking(con, chatID, tags);

        msg.replyWithMarkdown(`Successfully blocked the tag ${tags.length > 1 ? 'combination ' : ''} *${preparedTags.join(" ").replace(/\_/g, "\_")}*.\r\n` +
            `You will not receive articles containing these tags anymore.`);
    })

    bot.hears(/\/block/, (msg) => msg.replyWithMarkdown(Content.block, Extra.webPreview(false)));

    bot.hears(/\/unblock (.+)/, async (msg) => {
        const chatId = msg.message!.chat.id;
        const removeTagId = Number((msg.match![1]).toString().trim());

        const blockedTags = await getBacklistItems(con, chatId);

        if (!isValidId(msg, chatId, removeTagId, blockedTags.length, Log.getInstance())) {
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
