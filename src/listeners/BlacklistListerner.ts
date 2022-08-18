import { Content } from "../content/Content";
import { BlacklistedTag } from "../entity/BlacklistedTag";
import BotController from "../controller/BotController";
import BlacklistController from "../controller/BlackListController";

export function attachBlacklistListeners() {

    BotController.addListener("block", true, async (chatID, tagString) => {
        const preparedTags = await BlacklistController.addTag(chatID, tagString);

        return `Successfully blocked the tag *${preparedTags}*.\r\n` +
            `You will not receive articles containing these tags anymore.`;
    });

    BotController.addListener("block", false, () => Content.block, { disablePreview: true });

    BotController.addListener("unblock", true, async (chatId, removeTagId) => {

        return BlacklistController.removeTag(chatId, removeTagId).then(tagName => {
            return `Tag *${tagName}* was successfully removed.`;
        }).catch(error => {
            return error.message;
        });
    });

    BotController.addListener("unblock", false, () => Content.unblock, { disablePreview: true });

    BotController.addListener("blacklist", false, async (chatId) => {
        let tags = getFormattedList(await BlacklistController.getBlockedTags(chatId));

        if (tags.length === 0) {
            tags = "No tags are blocked.";
        }

        return `*Your medium tags:*\r\n\r\n${tags}`;
    }, { disablePreview: true });
}

function getFormattedList(tags: BlacklistedTag[]) {
    return tags
        .map((tag, index) => `*${index + 1}*: ${tag}`)
        .join("\r\n");
}