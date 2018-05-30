import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import Room from './Room';
import Bankroll from './Bankroll';

@Entity()
export default class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    name: string;

    @Column({ type: 'boolean' })
    isHero: boolean;

    @Column({ type: 'int' })
    roomId: number;

    @ManyToOne(type => Room, room => room.users)
    room: Room;

    @OneToMany(type => Bankroll, bankroll => bankroll.user)
    bankrolls: Bankroll[];

}
