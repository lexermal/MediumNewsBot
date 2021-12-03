import Telegraf from "telegraf";
import { TelegrafContext } from "telegraf/typings/context";
import { Connection, In, MoreThan } from "typeorm";
import { Article } from "../entity/Article";
import { UserArticle } from "../entity/UserArticle";
import Log from "../Logger";

const log = Log.getInstance();

export async function sendNewArticles(bot: Telegraf<TelegrafContext>, con: Connection) {
    log.info("Start sending new articles.");

    const sendingDuration = 0.2; //minutes

    const timestamp = new Date(Date.now() - sendingDuration * 60 * 1000); //now minus 4 minutes

    const userArticles = await con.manager.find(UserArticle, {
        where: { added: MoreThan(timestamp) }
    });

    log.debug("Found " + userArticles.length + " new unsent articles.");


    const groupedEntries = groupArticlesByUser(userArticles);
    log.debug(groupedEntries.size + " users will get new articles.");

    groupedEntries.forEach(async (articleIds, chatId) => {
        const unseenArticles = await con.manager.getRepository(Article).find({
            where: { articleId: In(articleIds) }
        });

        unseenArticles.forEach(item => {
            bot.telegram.sendMessage(chatId, item.link);
        });

        log.debug(`Sent ${userArticles.length} unread articles to ${chatId}.`);
    })

    log.debug(`Finished sending all unseen articles. Waiting ${sendingDuration} minutes.`)
    setTimeout(() => sendNewArticles(bot, con), sendingDuration * 60 * 1000);
}

function groupArticlesByUser(userArticles: UserArticle[]): Map<number, string[]> {
    const groupedEntries = new Map<number, string[]>();

    userArticles.forEach(article => {
        const id = article.chatId;

        const entries = groupedEntries.get(id);
        groupedEntries.set(id, [...entries || [], article.articleId]);
    });

    return groupedEntries;
}