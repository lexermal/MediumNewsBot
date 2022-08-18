export class Content {
    public static help = `
   The following commands are available:

/add ***<url>*** - Subscribe to a medium author, publisher, tag or domain.

/list - Get a list of all subscribed sources.

/remove ***<id>*** - Remove a source from your subscribed authors, publishers, tags or domains.

/block ***<tag or tag combinations>*** - Blocks articles that contain a curtain tag or combination of tags.

/unblock ***<id>*** - Removes the tag from the blacklist.

/blacklist - Get a list of blocked tags.

/help - Show all available commands.

This bot is powered by [Lexermal](https://github.com/lexermal).
`;


    public static start = `
    ⚡️ *Medium News Bot* ⚡️
    Never miss articles of your favorite publishers!

    `+ Content.help;

    public static add = `
    Subscribe to a new Medium publisher, user, tag or domain to receive their new articles.

    It works with */add <url>*

    *Example:*
    /add https://medium.com/hacker-daily

Hint: If you subscribe to a tag, you will get the latest news of that tag. That are usually many articles.

If you want to see all avaiable commands type /help`;

    public static remove = `
Remove publishers, users, tags or domains from your subscriptions.

    It works with */remove <id>*

    *Example:*
    /remove 3   Removes the source with the id 3.`;

    public static block = `
    Blacklist a tag. That way articles containing this tag will not be send to you.

    It works with */block <tag>*

    *Examples:*
    /block hello\\_world
    Articles having this tag will be blocked from getting sent to you.

    /block hello\\_world abc
    Articles containing booth tags (hello\\_world AND abc) will be blocked.`;

    public static unblock = `
Removes a tag from your blocked tags. After unblocking, future articles with this tag will be send.

    It works with */unblock <id>*

    *Example:*

    /unblock 3
    Removes the tag with the id 3 from your blocked tags.`;

    public static added = `was sucessfully added.
New articles will be send in short time.`;
}