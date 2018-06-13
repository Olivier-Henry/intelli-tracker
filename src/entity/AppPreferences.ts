import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export default class AppPreferences {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'boolean' })
    firstInstall: boolean;

}
