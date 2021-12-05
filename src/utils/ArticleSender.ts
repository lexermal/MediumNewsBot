import Telegraf from "telegraf";
import { TelegrafContext } from "telegraf/typings/context";
import { Connection, In, MoreThan } from "typeorm";
import { Article } from "../entity/Article";
import { UserArticle } from "../entity/UserArticle";
import Log from "../Logger";

const log = Log.getInstance();

export async function sendNewArticles(bot: Telegraf<TelegrafContext>, con: Connection, sendingDuration: number) {
    log.info("Start sending new articles.");

    const timestamp = new Date(Date.now() - sendingDuration * 60 * 1000); //now minus x minutes

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
            const categories = item.getCategories().map(c => "#" + c).join(" ");
            bot.telegram.sendMessage(chatId, item.link + "\r\n\r\nhashtags: " + categories);
        });

        log.debug(`Sent ${userArticles.length} unread articles to ${chatId}.`);
    })

    log.debug(`Finished sending all unseen articles. Waiting ${sendingDuration} minutes.`)
    setTimeout(() => sendNewArticles(bot, con, sendingDuration), sendingDuration * 60 * 1000);
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