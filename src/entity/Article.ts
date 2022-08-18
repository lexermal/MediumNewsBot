import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { convertTagToCheckableString } from "../utils/TagUtils";

@Entity()
export class Article {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    articleId: string;

    @Column()
    title: string;

    @Column()
    link: string;

    @Column()
    previewText: string;

    @Column()
    creator: string;

    @Column()
    pubDate: string;

    @Column({ nullable: true })
    imageURL: string;

    @Column()
    categories: string;


    public setTags(tags: string[]) {
        this.categories = convertTagToCheckableString(tags.join(";"));
    }

    public getTags() {
        return this.categories.split(";");
    }
}
