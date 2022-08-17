import { DataSource } from "typeorm";
import ArticleController from "../../controller/ArticleController";
import { Source } from "../entity/Source";
import { Fetcher } from "./Fetcher";
import Log from "./Logger";

const log = Log.getInstance();

export async function fetchNewArticles(con: DataSource, fetchingDuration: number) {
    const fetcher = new Fetcher();
    log.info("Starting to fetch new articles.");

    const sourceItems = await con.getRepository(Source).find();
    log.debug(`Found ${sourceItems.length} sources in the database.`);

    await Promise.all(sourceItems.map(async source => {
        const articles = await fetcher.getLatestArticles(source);

        const uniqueArticles = [...new Set(articles)];

        // the list of articles that could be added needs to be unique.
        // Otherwise the database check does not work because of the async operations
        await Promise.all(uniqueArticles.map(article => new ArticleController().addArticle(source.chatId, source.id, article)));
    }));

    log.debug(`Finished fetching new articles. Waiting for ${fetchingDuration} minutes.`);

    setTimeout(() => fetchNewArticles(con, fetchingDuration), (fetchingDuration) * 60 * 1000);
}

