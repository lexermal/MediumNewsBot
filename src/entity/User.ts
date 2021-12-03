import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    chatId: number;

    @Column()
    firstName: string;

    @Column()
    lastUpdated: number;
}
