import { Article } from "../entity/Article";
import Log from "../utils/Logger";
import ArticleSender from "../dal/ArticleSender";
import DatabaseController from "./DatabaseController";
import SourceController from "./SourceController";
import UserArticleController from "./UserArticleController";
import { ArticleFetcher } from "../dal/ArticleFetcher";

class _ArticleController {
    fetcher = new ArticleFetcher();

    getDBTable() {
        return DatabaseController.getConnection().getRepository(Article);
    }

    getArticle(articleId: string): Promise<Article | null> {
        return this.getDBTable().findOneBy({ articleId });
    }

    async exists(id: string) {
        return (await this.getDBTable().findOneBy({ articleId: id })) != null;
    }

    async addArticle(chatId: number, sourceId: number, article: Article,) {

        if (!await this.exists(article.articleId)) {

            await this.getDBTable().save(article);
            Log.debug(`Added new article ${article.articleId} with the title '${article.title}'.`);
        }

        UserArticleController.add(chatId, sourceId, article.articleId);
    }

    startArticleFetching(fetchingDuration: number) {
        this.fetchNewArticles(fetchingDuration);
    }

    async fetchNewArticles(fetchingDuration: number) {
        Log.info("Starting to fetch new articles.");

        const sourceItems = await SourceController.getAllSources();
        Log.debug(`Found ${sourceItems.length} sources in the database.`);

        await Promise.all(sourceItems.map(async source => {
            const articles = await this.fetcher.getLatestArticles(source);

            const uniqueArticles = [...new Set(articles)];

            // the list of articles that could be added needs to be unique.
            // Otherwise the database check does not work because of the async operations
            await Promise.all(uniqueArticles.map(article => ArticleController.addArticle(source.chatId, source.id, article)));
        }));

        Log.debug(`Finished fetching new articles. Waiting for ${fetchingDuration} minutes.`);

        setTimeout(() => this.fetchNewArticles(fetchingDuration), fetchingDuration * 60 * 1000);
    }

    async startArticleSending(sendingDuration: number) {
        this.sendNewArticles(sendingDuration);
    }


    async sendNewArticles(sendingDuration: number) {
        Log.info("Start sending new articles.");

        await new ArticleSender().sendArticles(sendingDuration);

        Log.debug(`Finished sending unseen articles. Waiting ${sendingDuration} minutes.`);
        setTimeout(() => this.sendNewArticles(sendingDuration), sendingDuration * 60 * 1000);
    }
}

const ArticleController = new _ArticleController();

export default ArticleController;