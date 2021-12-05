import Telegraf from "telegraf";
import { TelegrafContext } from "telegraf/typings/context";
import { Connection, In, MoreThan } from "typeorm";
import { Article } from "../entity/Article";
import { Source } from "../entity/Source";
import { UserArticle } from "../entity/UserArticle";
import Log from "../Logger";

const log = Log.getInstance();

export async function sendNewArticles(bot: Telegraf<TelegrafContext>, con: Connection, sendingDuration: number) {
    log.info("Start sending new articles.");

    const timestamp = new Date(Date.now() - sendingDuration * 60 * 1000); //now minus x minutes

    const userArticles = await con.manager.find(UserArticle, {
        where: { added: MoreThan(timestamp) }
    });

    log.debug(`Found ${userArticles.length} new unsent articles.`);


    const groupedEntries = groupArticlesByUser(userArticles);
    log.debug(groupedEntries.size + " users will get new articles.");

    groupedEntries.forEach(async (userArticles, chatId) => {
        const unseenArticles = await con.manager.getRepository(Article).find({
            where: { articleId: In(userArticles.map(ua => ua.articleId)) }
        });

        unseenArticles.forEach(async item => {
            const categories = item.getCategories().map(c => "#" + c).join(" ");

            const currentUserArticle = userArticles.filter(ua => ua.articleId === item.articleId)[0];

            const source = await con.manager.findOne(Source, currentUserArticle.sourceId);

            bot.telegram.sendMessage(chatId, `${item.link}\r\n\r\nsource: ${source?.urlPart1}\r\n${categories}`);
        });

        log.debug(`Sent ${userArticles.length} unread articles to ${chatId}.`);
    })

    log.debug(`Finished sending all unseen articles. Waiting ${sendingDuration} minutes.`)
    setTimeout(() => sendNewArticles(bot, con, sendingDuration), sendingDuration * 60 * 1000);
}

function groupArticlesByUser(userArticles: UserArticle[]): Map<number, UserArticle[]> {
    const groupedEntries = new Map<number, UserArticle[]>();

    userArticles.forEach(article => {
        const id = article.chatId;

        const entries = groupedEntries.get(id);
        groupedEntries.set(id, [...entries || [], article]);
    });

    return groupedEntries;
}