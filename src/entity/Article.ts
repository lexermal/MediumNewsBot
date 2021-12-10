import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

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


    public setCategories(categories: string[]) {
        this.categories = categories.join(";").replace(/-/g, "_");
    }

    public getCategories() {
        return this.categories.split(";");
    }
}
