import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Source {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    chatId: number;

    @Column()
    urlPart: string;

    @Column()
    type: SourceType;

    setParameters(chatId: number, type: SourceType, urlPart: string) {
        this.chatId = chatId;
        this.type = type;

        this.urlPart = urlPart;

        return this;
    }
}


export enum SourceType {
    TAG = "tag",
    USER = "user",
    DOMAIN = "domain",
    PUBLICATION = "publication",
}