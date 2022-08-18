import { BlacklistedTag } from "../entity/BlacklistedTag";
import Log from "../utils/Logger";
import DatabaseController from "./DatabaseController";
import UserArticleController from "./UserArticleController";

class _BacklistController {

    getDBTable() {
        return DatabaseController.getConnection().getRepository(BlacklistedTag);
    }

    async exists(chatId: number, tag: string) {
        return (await this.getDBTable().findOneBy({ tags: tag, chatId })) != null;
    }

    async getBlockedTags(chatId: number) {
        return await this.getDBTable().findBy({ chatId });
    }

    async addTag(chatId: number, rawTagString: string) {
        Log.debug(`User ${chatId} is trying to block the tag(s) '${rawTagString}'.`);

        const tagString = this.convertTagToCheckableString(rawTagString);

        if (!await this.exists(chatId, tagString)) {
            const tagToBeBlocked = new BlacklistedTag();

            tagToBeBlocked.chatId = chatId;
            tagToBeBlocked.tags = [tagString];


            await this.getDBTable().save(tagToBeBlocked);
            Log.info(`Successfully added blocking of the tag '${tagString}' for user ${chatId}.`);
        }

        return this.convertToReadableTag(tagString);
    }

    async removeTag(chatID: number, index: string): Promise<string> {

        if (!await this.isValidId(chatID, index)) {
            throw Error("The id is not valid.");
        }

        const item = (await this.getBlockedTags(chatID))[Number(index) - 1];

        this.getDBTable().remove(item);

        return this.convertToReadableTag(item.tags[0]); //=name of tag
    }

    async isValidId(chatId: number, id: string) {
        const items = await this.getBlockedTags(chatId);

        if (isNaN(id as unknown as number)) {
            Log.debug(`The user ${chatId} tried to delete a blocked tag with the invalid id '${id}'.`);
            return false;
        }

        if (Number(id) < 1 || Number(id) > items.length) {
            Log.debug(`The user ${chatId} tried to delete a blacked tag with an id that is not in the allowed range: '${id}'.`);
            return false;
        }
        return true;
    }

    convertTagToCheckableString(tag: string) {
        return tag
            .replaceAll(".", "_")
            .replaceAll("-", "_")
            .replaceAll("+", "")
            .replaceAll(" ", "+");
    }

    convertToReadableTag(tag: string) {
        return tag.replaceAll("+", " ");
    }

}

const BlacklistController = new _BacklistController();

export default BlacklistController;