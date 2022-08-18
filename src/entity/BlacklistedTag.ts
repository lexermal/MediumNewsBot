import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class BlacklistedTag {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    chatId: number;

    @Column()
    tag: string;
}
