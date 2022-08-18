import parse, { HTMLElement } from "node-html-parser";
import Parser from "rss-parser";
import SourceController from "../controller/SourceController";
import { Article } from "../entity/Article";
import { Source } from "../entity/Source";
import Log from "./Logger";

type FetcherItem = { [key: string]: any; } & Parser.Item;
export class ArticleFetcher {

    public static async isFetchable(url: string): Promise<boolean> {
        const parser = new Parser();

        return parser.parseURL(url).then(() => true).catch(() => false);
    }

    public async getLatestArticles(source: Source): Promise<Article[]> {
        const url = SourceController.getFeedUrl(source);

        return new Parser().parseURL(url)
            .catch(e => {
                Log.error(`The following error accured when fetching articles from ${url}: ${e.message}`, e);
                return { items: [] };
            }).then(feed => {
                const posts = feed.items.filter(item => typeof item.categories !== 'undefined' && item.categories.length > 0);

                return posts.map(this.convertToArticle);
            });
    }

    convertToArticle(item: FetcherItem) {
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
    }
}