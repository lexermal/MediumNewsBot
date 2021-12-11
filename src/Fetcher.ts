import parse, { HTMLElement } from "node-html-parser";
import Parser from "rss-parser";
import { Article } from "./entity/Article";
import { Source, SourceType } from "./entity/Source";
import Log from "./Logger";

export class Fetcher {
    private logger: Log;

    constructor(logger?: Log) {
        this.logger = logger || Log.getInstance();
    }

    public async getLatestArticles(source: Source) {
        return await this.getCurrentArticles(this.getURL(source.type, source.urlParts));
    }

    private getURL(type: SourceType, urlParts: string[]) {
        switch (type) {
            case SourceType.USER:
                return `https://medium.com/feed/@${urlParts[0]}`;
            case SourceType.DOMAIN:
                return `https://${urlParts[0]}/feed/`;
            case SourceType.TAG:
                return `https://medium.com/feed/tag/${urlParts[0]}`;
            // case SourceType.TAGGED:
            // return `https://medium.com/feed/${urlParts[0]}/tagged/${urlParts[1]}`;
            case SourceType.PUBLICATION:
                return `https://medium.com/feed/${urlParts[0]}`;
            default:
                throw new Error(`Unknown fetchingtype '${type}'`)
        }

    }

    async getCurrentArticles(url: string): Promise<Article[]> {
        const parser = new Parser();

        return parser.parseURL(url)
            .catch(e => {
                this.logger.error(`The following error accured when fetching articles from ${url}: ${e.message}`, e);
                return { items: [] };
            }).then(feed => {
                const posts = feed.items.filter(item => typeof item.categories !== 'undefined' && item.categories.length > 0)

                return posts.map(item => {
                    const article = new Article();

                    article.articleId = item.guid!;
                    article.title = item.title!.replace(/(?:\r\n|\r|\n)/g, ' ');
                    article.link = item.link!.split("?")[0];
                    article.creator = item.creator!;
                    article.pubDate = item.isoDate!;
                    article.previewText = (item.contentSnippet || "").replace(/(?:\r\n|\r|\n)/g, ' ').split("Continue reading on")[0].trim();
                    article.setCategories(item.categories!);

                    if (item.content) {
                        const htmlObject = parse(item.content);
                        const imageObject = (htmlObject.firstChild.childNodes[0].childNodes[0].childNodes[0] as HTMLElement);

                        article.imageURL = imageObject?.attrs?.src || "";
                    }

                    return article;
                })
            })
    }
}