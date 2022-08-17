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

    setUrlpart(part: string) {
        this.urlPart1 = part;
        this.urlPart2 = "";
    }
}


export enum SourceType {
    TAG = "tag",
    USER = "user",
    DOMAIN = "domain",
    PUBLICATION = "publication",
}