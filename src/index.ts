import "reflect-metadata";
import Log from './Logger';
import Telegraf from 'telegraf'
import Parser from 'rss-parser'
import Content from './content/en.json';
import { Connection, createConnection } from 'typeorm';
import { sendNewArticles } from './utils/ArticleSender';
import { fetchNewArticles } from './utils/ArticleFetcher';
import { SourceType } from './entity/Source';
import { addSource } from "./utils/SourceHandler";

const bot = new Telegraf(process.env.TELEGRAF_TOKEN || "")
const parser = new Parser()
const log = Log.getInstance();


async function startBot(con: Connection) {
    bot.hears(/\/start/, (msg) => msg.replyWithMarkdown(Content.start))

    bot.hears(/\/help/, (msg) => msg.replyWithMarkdown(Content.help))

    bot.hears(/\/user (.+)/, (msg) => {
        (async () => {
            try {
                const feed = await parser.parseURL(`https://medium.com/feed/@${msg.match![1]}`)
                const posts = feed.items.filter(item => typeof item.categories !== 'undefined' && item.categories.length > 0)
                posts.forEach(item => {
                    return msg.reply(item.link || "")
                })
            } catch (e) {
                console.log("User", e)
            }
        })()
    })

    bot.hears(/\/user/, (msg) => msg.replyWithMarkdown(Content.user))

    bot.hears(/\/custom (.+)/, (msg) => {
        (async () => {
            try {
                const feed = await parser.parseURL(`https://${msg.match![1]}/feed/`)
                const posts = feed.items.filter(item => typeof item.categories !== 'undefined' && item.categories.length > 0)
                posts.forEach(item => {
                    return msg.reply(item.link || "")
                })
            } catch (e) {
                console.log("Custom", e);
            }
        })()
    })

    bot.hears(/\/custom/, (msg) => msg.replyWithMarkdown(Content.custom))

    bot.hears(/\/tag (.+)/, (msg) => {
        (async () => {
            try {
                // const feed = await parser.parseURL(`https://medium.com/feed/tag/${msg.match![1]}`)
                // const posts = feed.items.filter(item => typeof item.categories !== 'undefined' && item.categories.length > 0)
                // posts.forEach(item => {
                //     return msg.reply(item.link || "")
                // })

                // fetchingDB.addFetchableItem(FetchingType.TAG, [msg.match![1]], "max-mustermann");

                // const articles = await new Fetcher().getLatestArticles(fetchingDB.getFetchingSources("max-mustermann"))


                // articles.forEach(item => msg.reply(item.$link));
            } catch (e) {
                console.log("Tag", e);
            }
        })()
    })

    bot.hears(/\/tag/, (msg) => msg.replyWithMarkdown(Content.tag))

    bot.hears(/\/tagged (.+)/, (msg) => {
        (async () => {
            const elements = msg.match![1].split(' ');
            try {
                // const feed = await parser.parseURL(`https://medium.com/feed/${elements[0]}/tagged/${elements[1]}`)
                // const posts = feed.items.filter(item => typeof item.categories !== 'undefined' && item.categories.length > 0)

                // posts.forEach(item => {
                //     articles.push(new Article(item.guid, item.title, item.link.split("?")[0], item.contentSnippet, item.creator, item.isoDate));

                //     return msg.reply(item.link)
                // })


                // const articles = await Utils.getCurrentArticles(`https://medium.com/feed/${elements[0]}/tagged/${elements[1]}`);

                // articles.forEach(item => {
                //     return msg.reply(item.$link);
                // })

                // fetchingDB.addFetchableItem(FetchingType.TAGGED, [elements[0], elements[1]], "max-mustermann");

                // const articles = await new Fetcher().getLatestArticles(fetchingDB.getFetchingSources("max-mustermann"))


                // articles.forEach(item => msg.reply(item.$link));

            } catch (e) {
                console.log("Tagged", e);
            }
        })()
    })

    bot.hears(/\/tagged/, (msg) => msg.replyWithMarkdown(Content.tagged))
    const user = 0

    bot.hears(/\/publication (.+)/, async (msg) => {
        try {
            const urlPart = msg.match![1];
            const chatID = msg.message!.chat.id;

            addSource(con, SourceType.PUBLICATION, [urlPart], chatID || 0);

            msg.reply(urlPart + Content.sucessfullyAdded);
        } catch (e) {
            console.log("Publication", e);
        }
    })

    bot.hears(/\/publication/, (msg) => msg.replyWithMarkdown(Content.publication))

    bot.launch()

    log.info("Successfully started the telegram bot!")
    return con;
}




createConnection().then(async connection => {
    log.info("Starting the telegram bot.");

    return connection;
}).then(startBot).then(async con => {

    log.info("Starting to fetch new articles and send out unread ones.")
    fetchNewArticles(con);
    sendNewArticles(bot, con);

}).catch(error => console.log(error));