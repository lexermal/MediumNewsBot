import { Context, Telegraf } from "telegraf";
import { DataSource, In, MoreThan } from "typeorm";
import { Article } from "../entity/Article";
import { BlacklistedTag } from "../entity/BlacklistedTag";
import { Source, SourceType } from "../entity/Source";
import { UserArticle } from "../entity/UserArticle";
import Log from "./Logger";

const log = Log.getInstance();

export async function sendNewArticles(bot: Telegraf<Context>, con: DataSource, sendingDuration: number) {
    log.info("Start sending new articles.");

    const timestamp = new Date(Date.now() - sendingDuration * 60 * 1000); //now minus x minutes

    const userArticles = await con.manager.find(UserArticle, {
        where: { added: MoreThan(timestamp.getTime()) }
    });

    log.debug(`Found ${userArticles.length} new unsent articles.`);


    const groupedEntries = groupArticlesByUser(userArticles);
    log.debug(groupedEntries.size + " users will get new articles.");

    groupedEntries.forEach(async (userArticles, chatId) => {
        const blockedTags = (await con.manager.findBy(BlacklistedTag, { chatId })).map(blacklistedTags => blacklistedTags.tags.join(","));

        const unseenArticles = await con.manager.getRepository(Article).find({
            where: { articleId: In(userArticles.map(ua => ua.articleId)) }
        });

        unseenArticles.forEach(async article => {

            const tags = article.getCategories();

            const blockedTagIndex = tags.some(tag => blockedTags.indexOf(tag) >= 0);

            //tags are inside because it needs to be tested if tagcombinations like '#health and #care' get really blocked
            console.log("blocked tags", blockedTags);
            console.log("tags used in article", tags.join(","));

            if (blockedTagIndex) {
                log.debug(`Blocked an article with the tags '${tags.join(" ")}' from getting send because the blocked tag ${blockedTags} matched.`);
                return;
            }

            const currentUserArticle = userArticles.filter(ua => ua.articleId === article.articleId)[0];

            const source = await con.manager.findOneBy(Source, { id: currentUserArticle.sourceId });

            const message = getMessage(article.title, article.previewText, article.link, source!, tags);

            if (!!article.imageURL) {
                await bot.telegram.sendPhoto(chatId, article.imageURL, { parse_mode: 'HTML', caption: message }).catch(e => {
                    log.error(`Could not send article ${article.articleId} because ${e.message}. The message was: ${message}`);
                });
            } else {
                await bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' }).catch(e => {
                    log.error(`Could not send article ${article.articleId} because ${e.message}. The message was: ${message}`);
                });
            }
        });

        log.debug(`Sent ${userArticles.length} unread articles to ${chatId}.`);
    });

    log.debug(`Finished sending all unseen articles. Waiting ${sendingDuration} minutes.`);
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

function getMessage(title: string, teaser: string, link: string, source: Source, tags: string[]) {
    const hashtags = tags.map(c => '\#' + c).join(" ");

    return `<b><a href="${link}">${title}</a></b>
${teaser}

From: <a href="${getSourceLink(source)}">${source.urlPart1}</a>
${hashtags}
`;
}

export function getSourceLink(source: Source): string {
    let url = `https://medium.com/${source.urlPart1}`;

    if (source.type === SourceType.DOMAIN) {
        return source.urlPart1;
    } else if (source.type === SourceType.TAG) {
        return `https://medium.com/tag/${source.urlPart1}`;
    }

    return url;
}