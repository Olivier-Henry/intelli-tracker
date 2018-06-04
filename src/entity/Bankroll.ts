import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import User from './User';


@Entity()
export default class Bankroll {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    amount: number;

    @Column({ type: 'datetime' })
    date: Date;

    @ManyToOne(type => User, user => user.bankrolls)
    user: User;

}
