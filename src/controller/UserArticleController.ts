import { UserArticle } from "../entity/UserArticle";
import DatabaseController from "./DatabaseController";
import { MoreThan } from "typeorm";

class UserArticleController {

    getDBTable() {
        return DatabaseController.getConnection().getRepository(UserArticle);
    }

    async getUnsendUserArticles(timestamp: Date) {
        return await this.getDBTable().find({
            where: { added: MoreThan(timestamp.getTime()) }
        });
    }

    async exists(chatId: number, articleId: string) {
        return (await this.getDBTable().findOneBy({ chatId, articleId: articleId })) != null;
    }

    async add(chatId: number, sourceId: number, articleId: string) {

        if (!await this.exists(chatId, articleId)) {

            const userArticle = new UserArticle();

            userArticle.chatId = chatId;
            userArticle.added = Date.now();
            userArticle.articleId = articleId;
            userArticle.sourceId = sourceId;

            await this.getDBTable().save(userArticle);
        }
    }
}


export default UserArticleController;