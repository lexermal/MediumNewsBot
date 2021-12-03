import Parser from "rss-parser";
import { Article } from "./entity/Article";
import { Source, SourceType } from "./entity/Source";

export class Fetcher {

    public async getLatestArticles(source: Source) {
        return await this.getCurrentArticles(this.getURL(source.type, source.urlParts));
    }

    private getURL(type: SourceType, urlParts: string[]) {
        switch (type) {
            case SourceType.PUBLISHER:
                return `https://medium.com/feed/${urlParts[0]}`;
            case SourceType.USER:
                return `https://medium.com/feed/@${urlParts[0]}`;
            case SourceType.DOMAIN:
                return `https://${urlParts[0]}/feed/`;
            case SourceType.TAG:
                return `https://medium.com/feed/tag/${urlParts[0]}`;
            case SourceType.TAGGED:
                return `https://medium.com/feed/${urlParts[0]}/tagged/${urlParts[1]}`;
            case SourceType.PUBLICATION:
                return `https://medium.com/feed/${urlParts[0]}`;
            default:
                throw new Error(`Unknown fetchingtype '${type}'`)
        }

    }

    async getCurrentArticles(url: string): Promise<Article[]> {
        const parser = new Parser();

        const feed = await parser.parseURL(url);
        const posts = feed.items.filter(item => typeof item.categories !== 'undefined' && item.categories.length > 0)

        return posts.map(item => {
            const article = new Article();

            article.articleId = item.guid!;
            article.title = item.title!;
            article.link = item.link!.split("?")[0];
            article.creator = item.creator!;
            article.pubDate = item.isoDate!;
            article.previewText = item.contentSnippet||"";
            article.setCategories(item.categories!);

            return article;
        })
    }
}