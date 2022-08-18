import ArticleController from "../../controller/ArticleController";
import SourceController from "../../controller/SourceController";
import { Fetcher } from "./Fetcher";
import Log from "../../utils/Logger";

const fetcher = new Fetcher();

export async function fetchNewArticles(fetchingDuration: number) {
    Log.info("Starting to fetch new articles.");

    const sourceItems = await SourceController.getAllSources();
    Log.debug(`Found ${sourceItems.length} sources in the database.`);

    await Promise.all(sourceItems.map(async source => {
        const articles = await fetcher.getLatestArticles(source);

        const uniqueArticles = [...new Set(articles)];

        // the list of articles that could be added needs to be unique.
        // Otherwise the database check does not work because of the async operations
        await Promise.all(uniqueArticles.map(article => ArticleController.addArticle(source.chatId, source.id, article)));
    }));

    Log.debug(`Finished fetching new articles. Waiting for ${fetchingDuration} minutes.`);

    setTimeout(() => fetchNewArticles(fetchingDuration), (fetchingDuration) * 60 * 1000);
}

