import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class UserArticle {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    chatId: number;

    @Column()
    articleId: string;

    @Column()
    added: number;

}
