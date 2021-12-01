import Parser from "rss-parser";

export async function getCurrentArticles(url: string): Promise<Article[]> {
    const parser = new Parser();

    const feed = await parser.parseURL(url);
    const posts = feed.items.filter(item => typeof item.categories !== 'undefined' && item.categories.length > 0)

    return posts.map(item => {
        return new Article(item.guid, item.title, item.link.split("?")[0], item.contentSnippet, item.creator, item.isoDate);
    })
}