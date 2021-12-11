import Telegraf from "telegraf";
import { TelegrafContext } from "telegraf/typings/context";
import { Connection, In, MoreThan } from "typeorm";
import { Article } from "../entity/Article";
import { Source, SourceType } from "../entity/Source";
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
            const tags = item.getCategories();

            const currentUserArticle = userArticles.filter(ua => ua.articleId === item.articleId)[0];

            const source = await con.manager.findOne(Source, currentUserArticle.sourceId);

            const message = getMessage(item.title, item.previewText, item.link, source!, tags);


            if (!!item.imageURL) {
                await bot.telegram.sendPhoto(chatId, item.imageURL, { parse_mode: 'MarkdownV2', caption: message });
            } else {
                await bot.telegram.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
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