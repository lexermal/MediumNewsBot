import Telegraf from "telegraf";
import { TelegrafContext } from "telegraf/typings/context";
import { Connection, In, MoreThan } from "typeorm";
import { Article } from "../entity/Article";
import { BlacklistedTag } from "../entity/BlacklistedTag";
import { Source, SourceType } from "../entity/Source";
import { UserArticle } from "../entity/UserArticle";
import Log from "./Logger";

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
        const blockedTags = (await con.manager.find(BlacklistedTag, { chatId })).map(blacklistedTags => blacklistedTags.tags.join(","));

        const unseenArticles = await con.manager.getRepository(Article).find({
            where: { articleId: In(userArticles.map(ua => ua.articleId)) }
        });

        unseenArticles.forEach(async article => {

            const tags = article.getCategories();

            const blockedTagIndex = tags.some(tag => blockedTags.indexOf(tag) >= 0);

            //tags are inside because it needs to be tested if tagcombinations like '#health and #care' get really blocked
            console.log("blocked tags", blockedTags)
            console.log("tags used in article", tags.join(","))

            if (blockedTagIndex) {
                log.debug(`Blocked an article with the tags '${tags.join(" ")}' from getting send because the blocked tag ${blockedTags} matched.`);
                return;
            }

            const currentUserArticle = userArticles.filter(ua => ua.articleId === article.articleId)[0];

            const source = await con.manager.findOne(Source, currentUserArticle.sourceId);

            const message = getMessage(article.title, article.previewText, article.link, source!, tags);

            if (!!article.imageURL) {
                await bot.telegram.sendPhoto(chatId, article.imageURL, { parse_mode: 'MarkdownV2', caption: message }).catch(e => {
                    log.error(`Could not send article ${article.articleId} because ${e.message}. The message was: ${message}`);
                });
            } else {
                await bot.telegram.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' }).catch(e => {
                    log.error(`Could not send article ${article.articleId} because ${e.message}. The message was: ${message}`);
                });
            }
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

function getMessage(title: string, teaser: string, link: string, source: Source, tags: string[]) {
    const hashtags = tags.map(c => '\#' + c).join(" ");

    return `**[${escape(title)}](${escape(link)})**
${escape(teaser)}

From: ${getSourceLink(source)}
${escape(hashtags)}`;
}

function escape(text: string) {
    return text
        .replace(/\./g, "\\.")
        .replace(/\-/g, '\-')
        .replace(/\_/g, "\\_")
        .replace(/\|/g, "\\|")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        .replace(/\>/g, "\\>")
        .replace(/\#/g, "\\#")
        .replace(/\</g, "\\<")
        .replace(/\-/g, "\\-")
        .replace(/\+/g, "\\+")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]")
        .replace(/\!/g, "\\!");
}

export function getSourceLink(source: Source): string {
    const urlPart = escape(source.urlPart1);


    let url = `https://medium.com/${urlPart}`;

    if (source.type === SourceType.DOMAIN) {
        url = urlPart;
    } else if (source.type === SourceType.TAG) {
        url = `https://medium.com/tag/${urlPart}`;
    }

    return `[${urlPart}](${url})`;
}