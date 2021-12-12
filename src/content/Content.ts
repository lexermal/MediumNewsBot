export class Content {
    public static help = `
    You can control me by sending these commands:
    
🔸/add ***<url>*** - Subscribe to a medium author, publisher or tag.

🔸/list - Get a list of all subscriped sources.

🔸/remove ***<id>*** - Remove a source from your subscriped ones.

🔸/block ***<tag or tag combinations>*** - Blocks articles that contain a curtain tag or combination of tags.

🔸/unblock ***<id>*** - Unblocks articles that contain a curtain tag or combination of tags.

🔸/blacklist - Get a list of blocked tags.


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

Hint: If you subscribe to a tag, you will get the latest news of that tag. That are usually many articles.
    
If you need the list of the commands just type /help`;

    public static remove = `
Remove publisher, users, domains or tags from your subscriptions.

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
    Artcles containing booth tags (hello\\_world AND abc) will be blocked.


Hint: If you subscribed to the tag you want to block, you will be unsubscriped from this tag.
    
If you need the list of the commands just type /help`;

    public static unblock = `
Removes a tag from your blocked tags. After unblocking the tag, articles with this tag will be send again to you.

    It works with */unblock <id>*

    *Example:*
    
    /unblock 3   
    Removes the tag with the id 3 from your blocked tags.`;

    public static added = `was sucessfully added.
The news will apear in short time.`;
}