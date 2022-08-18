import { Source, SourceType } from "../entity/Source";
import Log from "../utils/Logger";
import DatabaseController from "./DatabaseController";

class _SourceController {

    getDBTable() {
        return DatabaseController.getConnection().getRepository(Source);
    }

    async getSources(chatId: number) {
        return await this.getDBTable().findBy({ chatId });
    }

    async getSource(sourceId: number) {
        return await this.getDBTable().findOneBy({ id: sourceId });
    }

    async getAllSources() {
        return await this.getDBTable().find();
    }

    async exists(chatId: number, urlPart: string): Promise<boolean> {
        return (await this.getDBTable().findOneBy({ urlPart, chatId })) != null;
    }

    async addSource(chatId: number, type: SourceType, urlPart: string) {

        if (!await this.exists(chatId, urlPart)) {

            const source = new Source();

            source.type = type;
            source.chatId = chatId;
            source.urlPart = urlPart;

            await this.getDBTable().save(source);

            Log.debug(`Successfully added source '${urlPart}' for user ${chatId}.`);
        }
    }

    async removeSource(chatID: number, index: string): Promise<string> {

        if (!await this.isValidId(chatID, index)) {
            throw Error("The id is not valid.");
        }

        const item = (await this.getSources(chatID))[Number(index) - 1];

        this.getDBTable().remove(item);
        return item.urlPart; //=name of source
    }

    async isValidId(chatId: number, id: string) {
        const sources = await this.getSources(chatId);

        if (isNaN(id as unknown as number)) {
            Log.debug(`The user ${chatId} tried to delete a source with the invalid id '${id}'.`);
            return false;
        }

        if (Number(id) < 1 || Number(id) > sources.length) {
            Log.debug(`The user ${chatId} tried to delete a source with an id that is not in the allowed range: '${id}'.`);
            return false;
        }
        return true;
    }

    getFeedUrl(source: Source) {
        switch (source.type) {
            case SourceType.USER:
                return `https://medium.com/feed/@${source.urlPart}`;
            case SourceType.DOMAIN:
                return `https://${source.urlPart}/feed`;
            case SourceType.TAG:
                return `https://medium.com/feed/tag/${source.urlPart}`;
            case SourceType.PUBLICATION:
                return `https://medium.com/feed/${source.urlPart}`;
            default:
                throw new Error(`Unknown fetchingtype '${source.type}'`);
        }
    }

    urlToSource(chatId: number, url: URL) {
        const source = new Source();

        if (url.hostname !== "medium.com") {
            return source.setParameters(chatId, SourceType.DOMAIN, url.hostname);
        }

        const urlParts = url.pathname.split("/");

        if (url.pathname.startsWith("/tag/")) {
            return source.setParameters(chatId, SourceType.TAG, urlParts[2]);
        }

        if (url.pathname.startsWith("/@")) {
            return source.setParameters(chatId, SourceType.USER, urlParts[1].substring(1));
        }

        return source.setParameters(chatId, SourceType.PUBLICATION, urlParts[1]);  // eg. /personal-growth
    }

    getUrlOfSource(source: Source) {
        switch (source.type) {
            case SourceType.USER:
                return `https://medium.com/@${source.urlPart}`;
            case SourceType.DOMAIN:
                return `https://${source.urlPart}`;
            case SourceType.TAG:
                return `https://medium.com/tag/${source.urlPart}`;
            case SourceType.PUBLICATION:
                return `https://medium.com/${source.urlPart}`;
            default:
                throw new Error(`Unknown fetchingtype '${source.type}'`);
        }
    }
}

const SourceController = new _SourceController();

export default SourceController;