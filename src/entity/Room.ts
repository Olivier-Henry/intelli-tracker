import { Entity, Column, PrimaryGeneratedColumn, OneToMany, RelationCount } from 'typeorm';
import User from './User';

@Entity()
export default class Room {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', unique: true })
    name: string;

    @Column({ type: 'text' })
    path: string;

    @OneToMany(type => User, user => user.room)
    users: User[];

    @RelationCount((room: Room) => room.users, 'user', qb => qb.andWhere('user.isHero = :isHero', { isHero: true }))
    heroesCount: number;
}
