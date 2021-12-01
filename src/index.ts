import Telegraf from 'telegraf'
import Parser from 'rss-parser'

import Content from '../../resources/content/en.json'
import { getCurrentArticles } from './Utils'

const bot = new Telegraf(process.env.TELEGRAF_TOKEN)
const parser = new Parser()

const articles = [] as Article[];


bot.hears(/\/start/, (msg) => msg.replyWithMarkdown(Content.start))

bot.hears(/\/help/, (msg) => msg.replyWithMarkdown(Content.help))

bot.hears(/\/user (.+)/, (msg) => {
    (async () => {
        try {
            const feed = await parser.parseURL(`https://medium.com/feed/@${msg.match[1]}`)
            const posts = feed.items.filter(item => typeof item.categories !== 'undefined' && item.categories.length > 0)
            posts.forEach(item => {
                return msg.reply(item.link)
            })
        } catch (e) {
            console.log("User", e)
        }
    })()
})

bot.hears(/\/user/, (msg) => msg.replyWithMarkdown(Content.user))

bot.hears(/\/publication (.+)/, (msg) => {
    (async () => {
        try {
            // const feed = await parser.parseURL(`https://medium.com/feed/${msg.match[1]}`)
            // const posts = feed.items.filter(item => typeof item.categories !== 'undefined' && item.categories.length > 0)

            // console.log(posts);
            // posts.forEach(item => {
            //     return msg.reply(item.link)
            // })

            const articles = await getCurrentArticles(`https://medium.com/feed/${msg.match[1]}`);

            articles.forEach(item => {
                return msg.reply(item.$link);
            })

        } catch (e) {
            console.log("Publication", e);
        }
    })()
})

bot.hears(/\/publication/, (msg) => msg.replyWithMarkdown(Content.publication))

bot.hears(/\/custom (.+)/, (msg) => {
    (async () => {
        try {
            const feed = await parser.parseURL(`https://${msg.match[1]}/feed/`)
            const posts = feed.items.filter(item => typeof item.categories !== 'undefined' && item.categories.length > 0)
            posts.forEach(item => {
                return msg.reply(item.link)
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
            const feed = await parser.parseURL(`https://medium.com/feed/tag/${msg.match[1]}`)
            const posts = feed.items.filter(item => typeof item.categories !== 'undefined' && item.categories.length > 0)
            posts.forEach(item => {
                return msg.reply(item.link)
            })
        } catch (e) {
            console.log("Tag", e);
        }
    })()
})

bot.hears(/\/tag/, (msg) => msg.replyWithMarkdown(Content.tag))

bot.hears(/\/tagged (.+)/, (msg) => {
    (async () => {
        const elements = msg.match[1].split(' ');
        try {
            // const feed = await parser.parseURL(`https://medium.com/feed/${elements[0]}/tagged/${elements[1]}`)
            // const posts = feed.items.filter(item => typeof item.categories !== 'undefined' && item.categories.length > 0)

            // posts.forEach(item => {
            //     articles.push(new Article(item.guid, item.title, item.link.split("?")[0], item.contentSnippet, item.creator, item.isoDate));

            //     return msg.reply(item.link)
            // })


            const articles = await getCurrentArticles(`https://medium.com/feed/${elements[0]}/tagged/${elements[1]}`);

            articles.forEach(item => {
                return msg.reply(item.$link);
            })

        } catch (e) {
            console.log("Tagged", e);
        }
    })()
})

bot.hears(/\/tagged/, (msg) => msg.replyWithMarkdown(Content.tagged))

bot.launch()
