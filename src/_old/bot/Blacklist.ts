import { Content } from "../content/Content";
import { BlacklistedTag } from "../../entity/BlacklistedTag";
import { addTagBlocking, getBacklistItems } from "../handler/BlacklistHandler";
import { DataSource } from "typeorm";
import BotController from "../../controller/BotController";

export function attachBlacklistHandling(con: DataSource) {

    BotController.addListener("block", true, async (chatID, additionalText) => {
        const tags = additionalText.split(" ");

        const preparedTags = await addTagBlocking(con, chatID, tags);

        return `Successfully blocked the tag ${tags.length > 1 ? 'combination ' : ''} *${preparedTags.join(" ").replace(/\_/g, "\_")}*.\r\n` +
            `You will not receive articles containing these tags anymore.`;
    });

    BotController.addListener("block", false, () => Content.block, { disablePreview: true });

    BotController.addListener("unblock", true, async (chatId, removeTagId) => {
        const blockedTags = await getBacklistItems(con, chatId);

        //this check should happen in controller, like with sources
        // if (!isValidId(msg, chatId, removeTagId, blockedTags.length, Log.getInstance())) {
        // return;
        // }

        const tagToBeRemoved = blockedTags[Number(removeTagId) - 1];
        const tagName = tagToBeRemoved.tags;

        con.getRepository(BlacklistedTag).remove(tagToBeRemoved);

        return `Tag *${tagName.join("* in combination with tag *").replace(/\_/g, "\\_")}* was successfully removed.`;
    });

    BotController.addListener("blacklist", false, async (chatId) => {
        let sourceList = (await getBacklistItems(con, chatId))
            .map((blacklistedTag, index) => `*${index + 1}*: ${blacklistedTag.tags.join(" ")}`)
            .join("\r\n")
            .replace(/\_/g, "\\_");

        if (sourceList.length === 0) {
        }

        return `*Your blocked tags:*\r\n\r\n${sourceList}`;
    }, { disablePreview: true });

    BotController.addListener("unblock", false, () => Content.unblock, { disablePreview: true });
}
