import { Connection } from "typeorm";
import { BlacklistedTag } from "../entity/BlacklistedTag";
import { Source } from "../entity/Source";
import Log from "../utils/Logger";

const log = Log.getInstance();

export async function getBacklistItems(con: Connection, chatId: number) {
    return await con.getRepository(BlacklistedTag).find({ chatId });
}


export async function addTagBlocking(con: Connection, chatId: number, rawTags: string[]) {
    const tags = rawTags.map(tag => tag.replace(/\./g, "_").replace(/\-/g, "_"));

    log.debug(`User ${chatId} is trying to block the tag '${tags.join(" ")}'.`);


    //check if already found
    if (await con.manager.findOne(BlacklistedTag, { tags, chatId })) {
        log.debug("Found the tag already in the list of blocked tags.");
        return tags;
    }

    if (tags.length === 1) {
        const subscribedTag = await con.manager.findOne(Source, { urlPart1: tags[0], chatId })

        //found subscribed tag
        if (subscribedTag) {
            con.manager.remove(subscribedTag);
            log.debug(`Removed tag '${tags.join(" ")}' from list of subscribed sources.`);
            return tags;
        }
    }

    const blockedTag = new BlacklistedTag();

    blockedTag.chatId = chatId;
    blockedTag.tags = tags;

    con.manager.save(blockedTag);

    log.info(`Successfully added blocking of the tag(s) '${tags.join(" ")}' for user ${chatId}.`);

    return tags;
}

export async function removeTagBlocking(con: Connection, chatId: number, id: number) {

}
