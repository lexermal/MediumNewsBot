# Medium News Bot

Never miss articles of your favorite publishers!

Try it out: [mediumNewsBot](t.me/MediumListenerBot)


#### List of available commands:

- ***/add*** `<url>` - Subscribe to a medium author, publisher, tag or domain.

- ***/list*** - Get a list of all subscribed sources.

- ***/remove*** `<id>` - Remove a source from your subscribed authors, publishers, tags or domains.

- ***/block*** `<tag or tag combinations>` - Blocks articles that contain a curtain tag or combination of tags.

- ***/unblock*** `<id>` - Removes the tag from the blacklist.

- ***/blacklist*** - Get a list of blocked tags.

- ***/help*** - Show all available commands.


## Build the container
1. docker build . -t mediumnewsbot
2. docker run -d mediumnewsbot

## Todo
* Update the database schema

## Copyright

Copyright by Lexermal