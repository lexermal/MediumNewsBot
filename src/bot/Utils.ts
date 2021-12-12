import { TelegrafContext } from "telegraf/typings/context";
import Log from "../utils/Logger";

export function isValidId(msg: TelegrafContext, chatId: number, removeSourceId: number, maxIdIndex: number, log: Log) {
    if (Number.isNaN(removeSourceId)) {
        log.debug(`The user ${chatId} tried to delete a source with the invalid id '${removeSourceId}'.`)
        msg.replyWithMarkdown("The privided id is no number.");
        return false;
    }

    if (removeSourceId < 1 || removeSourceId > maxIdIndex) {
        log.debug(`The user ${chatId} tried to delete a source with an id that is not in the allowed range: '${removeSourceId}'.`)
        msg.replyWithMarkdown(`The id ${removeSourceId} was not found.`);
        return false;
    }
    return true;
}