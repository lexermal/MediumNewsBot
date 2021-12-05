# Medium news bot

Read Medium articles on Telegram!

Try it out: [mediumNewsBot](https://telegram.me/keiwosle_new_bot)


#### List of available commands:

- ***/add*** `<url>` - Adds the publisher/domain/tag to your subscriped sources.

- ***/list*** - Shows all your subscriped sources.

- ***/remove*** `<id>` - Removes the publisher/domain/tag to your subscriped sources.
  

## Build the container
1. sudo docker build . -t mediumnewsbot
2. sudo docker run -d mediumnewsbot 

## Todo
* seen proxy for knowing which article the user really reads. 
* Checking out how migrations work with typeorm.
* Set a flag when a article is sent out to a user
* Tags should maybe only return the top article, not all.