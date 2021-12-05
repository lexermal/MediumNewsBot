import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Source {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    chatId: number;

    @Column()
    urlPart1: string;

    @Column()
    urlPart2: string;

    @Column()
    type: SourceType;

    get urlParts(): string[] {
        return [this.urlPart1, this.urlPart2];
    }

    setUrlparts(urlParts: string[]) {
        this.urlPart1 = urlParts[0];
        this.urlPart2 = urlParts[1] || "";
    }
}


export enum SourceType {
    TAG = "tag",
    USER = "user",
    DOMAIN = "domain",
    PUBLICATION = "publication",
}