import { Source, SourceType } from "../entity/Source";
import Log from "../_old/utils/Logger";
import DatabaseController from "./DatabaseController";

const log = Log.getInstance();

class _SourceController {

    getDBTable() {
        return DatabaseController.getConnection().getRepository(Source);
    }

    async getSources(chatId: number) {
        return await this.getDBTable().findBy({ chatId });
    }

    async getAllSources() {
        return await this.getDBTable().find();
    }

    async exists(chatId: number, urlPart: string): Promise<boolean> {
        return (await this.getDBTable().findOneBy({ urlPart1: urlPart, chatId })) != null;
    }

    async addSource(chatId: number, type: SourceType, urlPart: string) {

        if (!await this.exists(chatId, urlPart)) {

            const source = new Source();

            source.type = type;
            source.chatId = chatId;
            source.setUrlpart(urlPart);

            await this.getDBTable().save(source);

            log.debug(`Successfully added source '${urlPart}' for user ${chatId}.`);
        }
    }

    async removeSource(chatID: number, index: string): Promise<string> {

        if (!await this.isValidId(chatID, index)) {
            throw Error("The id is not valid.");
        }

        const item = (await this.getSources(chatID))[Number(index) - 1];

        this.getDBTable().remove(item);
        return item.urlPart1; //=name of source
    }

    async isValidId(chatId: number, id: string) {
        const sources = await this.getSources(chatId);

        if (isNaN(id as unknown as number)) {
            log.debug(`The user ${chatId} tried to delete a source with the invalid id '${id}'.`);
            return false;
        }

        if (Number(id) < 1 || Number(id) > sources.length) {
            log.debug(`The user ${chatId} tried to delete a source with an id that is not in the allowed range: '${id}'.`);
            return false;
        }
        return true;
    }
}

const SourceController = new _SourceController();

export default SourceController;