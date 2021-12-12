# Medium News Bot

Read Medium articles on Telegram!

Try it out: [mediumNewsBot](https://telegram.me/keiwosle_new_bot)


#### List of available commands:

- ***/add*** `<url>` - Adds the publisher/domain/tag/user to your subscriped sources.
  Hint: If you subscribe to tags, you will get the latest news of that tag. That is usually very much.

- ***/list*** - Shows all your subscriped sources.

- ***/remove*** `<id>` - Removes the publisher/domain/tag to your subscriped sources.
  
- ***/block*** `<tag or tag combinations>` - Blocks articles that contain a curtain tag or combination of tags.

- ***/unblock***`<id>` - Unblocks articles that contain a curtain tag or combination of tags.

- ***/blacklist*** - Get a list of blocked tags.

## Build the container
1. docker build . -t mediumnewsbot
2. docker run -d mediumnewsbot 

## Todo
* seen proxy for knowing which article the user really reads. 
* Fix crazy bug where an article gets send 20 times