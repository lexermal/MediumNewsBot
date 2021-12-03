export class Content {
    public static help = `
    You can control me by sending these commands:
    
🔸/add ***<url>*** - Subscribe to a medium author, publisher or tag.

🔸/list - Get a list of all subscriped sources.

🔸/remove ***<id>*** - Remove a source from your subscriped ones.


    If you need the list of the commands just type /help`;


    public static start = `
    ⚡️ *Medium News Bot* ⚡️
    Read Medium articles on Telegram!
    
    `+ Content.help;

    public static add = `
    Subscribe to a new Medium publisher, user, domain or tag to receive their new articles.
    
    It works with */add <url>*
    
    *Example:*
    /add https://medium.com/hacker-daily
    
If you need the list of the commands just type /help`;

public static remove = `
Remove publisher, users, domains or tags from your subscriptions.

    It works with */remove <id>*

    *Example:*
    /remove 3   Removes the source with the id 3.`;

    public static added = `was sucessfully added.
The news will apear in short time.`;
}