# Mediumgram

Read Medium articles on Telegram!

Try it out: [Mediumgram](https://telegram.me/mediumgrambot)


#### List of available commands:


- ***/add*** `<url>` - Adds the publisher/domain/tag to your subscriped sources.

- ***/list*** - Shows all your subscriped sources.

- ***/remove*** `<id>` - Removes the publisher/domain/tag to your subscriped sources.
  
- ***/user*** `<username>` - Get the last articles from a specific user

- ***/publication*** `<publication>` - Get the last articles from a specific publication

- ***/custom*** `<domain.com>` - Get the last articles from a specific publication with custom domain

- ***/tag*** `<tag>` - Get the last articles with a specific tag

- ***/tagged*** `<publication>` `<tag>` - Get the last articles from a specific publication with a specific tag

## Known Issues
* If right after the start an user adds a source, the articles will not be set. It's an timing issue.


## Build the container
1. sudo docker build . -t mediumgram
2. sudo docker run -d mediumgram 

## Todo
* seen proxy for knowing which article the user really reads. 
* Remove unnecessary commands.