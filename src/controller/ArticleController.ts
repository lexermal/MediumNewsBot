import { Article } from "../_old/entity/Article";
import Log from "../_old/utils/Logger";
import DatabaseController from "./DatabaseController";
import UserArticleController from "./UserArticleController";

const log = Log.getInstance();

class ArticleController {

    getDBTable() {
        return DatabaseController.getConnection().getRepository(Article);
    }

    async exists(id: string) {
        return (await this.getDBTable().findOneBy({ articleId: id }))!=null;
    }

    async addArticle(chatId: number, sourceId: number, article: Article,) {

        if (!await this.exists(article.articleId)) {

            await this.getDBTable().save(article);
            log.debug(`Added new article ${article.articleId} with the title '${article.title}'.`);
        }

        new UserArticleController().add(chatId, sourceId, article.articleId);
    }
}

export default ArticleController;