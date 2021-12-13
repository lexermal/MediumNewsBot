import { Connection } from "typeorm";
import { Article } from "../entity/Article";
import { Source } from "../entity/Source";
import { UserArticle } from "../entity/UserArticle";
import { Fetcher } from "./Fetcher";
import Log from "./Logger";

const fetcher = new Fetcher();
const log = Log.getInstance();

export async function fetchNewArticles(con: Connection, fetchingDuration: number) {
    log.info("Starting to fetch new articles.");

    const sourceItems = await con.getRepository(Source).find();
    log.debug(`Found ${sourceItems.length} sources in the database.`);

    await Promise.all(sourceItems.map(async source => {
        const articles = await fetcher.getLatestArticles(source);

        const uniqueArticles = [...new Set(articles)];

        // the list of articles that could be added needs to be unique. 
        // Otherwise the database check does not work because of the async operations 
        await Promise.all(uniqueArticles.map(article => addArticle(con, article, source.chatId, source.id)));
    }))

    log.debug(`Finished fetching new articles. Waiting for ${fetchingDuration} minutes.`);

    setTimeout(() => fetchNewArticles(con, fetchingDuration), (fetchingDuration) * 60 * 1000);
}


export async function addArticle(con: Connection, article: Article, chatId: number, sourceId: number) {

    if (!await con.getRepository(Article).findOne({ articleId: article.articleId })) {

        await con.manager.save(article);
        log.debug(`Added new article ${article.articleId} with the title '${article.title}'.`);
    }

    if (!await con.getRepository(UserArticle).findOne({ chatId, articleId: article.articleId })) {

        const userArticle = new UserArticle();

        userArticle.chatId = chatId;
        userArticle.added = Date.now();
        userArticle.articleId = article.articleId;
        userArticle.sourceId = sourceId;

        await con.manager.save(userArticle);
    }
}