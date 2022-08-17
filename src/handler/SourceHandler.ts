import { DataSource } from "typeorm";
import { SourceType, Source } from "../entity/Source";
import Log from "../utils/Logger";

const log = Log.getInstance();

export async function addSource(con: DataSource, type: SourceType, urlParts: string[], chatId: number) {
    log.debug(`Chat ${chatId} is trying to add the source '${urlParts}' of type ${type}.`);

    if (!await con.getRepository(Source).findOneBy({ urlPart1: urlParts[0], urlPart2: urlParts[1] || "", chatId })) {

        const source = new Source();

        source.type = type;
        source.chatId = chatId;
        source.setUrlparts(urlParts);

        await con.manager.save(source);

        log.debug(`Successfully added source '${urlParts}' for user ${chatId}.`);
    }
}

export async function getSourceList(con: DataSource, chatId: number) {
    return await con.getRepository(Source).findBy({ chatId });
}