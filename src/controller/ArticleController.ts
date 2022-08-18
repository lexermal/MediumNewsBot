import { Article } from "../entity/Article";
import Log from "../_old/utils/Logger";
import DatabaseController from "./DatabaseController";
import UserArticleController from "./UserArticleController";

class _ArticleController {

    getDBTable() {
        return DatabaseController.getConnection().getRepository(Article);
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
}

const ArticleController = new _ArticleController();

export default ArticleController;