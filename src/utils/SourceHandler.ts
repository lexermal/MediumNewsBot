import Log from "../Logger";
import { Connection } from "typeorm";
import { SourceType, Source } from "../entity/Source";

const log = Log.getInstance();

export async function addSource(con: Connection, type: SourceType, urlParts: string[], chatId: number) {
    log.debug(`Chat ${chatId} is trying to add the source '${urlParts}' of type ${type}.`)

    if (!await con.getRepository(Source).findOne({ urlPart1: urlParts[0], urlPart2: urlParts[1] || "", chatId })) {

        const source = new Source();

        source.type = type;
        source.chatId = chatId;
        source.setUrlparts(urlParts);

        await con.manager.save(source);

        log.debug(`Successfully added source '${urlParts}' for user ${chatId}.`);
    }
}

export async function getSourceList(con: Connection, chatId: number) {
    return await con.getRepository(Source).find({ chatId });
}