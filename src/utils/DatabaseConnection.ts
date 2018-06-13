import 'reflect-metadata';
import { remote, IncomingMessage } from 'electron';
import { Connection, createConnection } from 'typeorm';
import * as path from 'path';
import AppPreferences from '../entity/AppPreferences';
import Room from '../entity/Room';
import User from '../entity/User';
import Bankroll from '../entity/Bankroll';
import { Promise } from 'q';
import { Injectable } from '@angular/core';

@Injectable()
export default class DatabaseConnection {

    public ready: boolean;
    private conn: Connection;

    constructor() {
    }

    public connect(): Promise<boolean> {
        return Promise<boolean>(resolve => {
            createConnection({
                'type': 'sqlite',
                'database': path.join(remote.app.getPath('userData'), 'data.db'),
                'synchronize': false,
                'logging': 'all',
                'entities': [
                    AppPreferences,
                    User,
                    Room,
                    Bankroll
                ],
                'migrations': [
                    'migration/**/*.ts'
                ],
                'subscribers': [
                    'subscriber/**/*.ts'
                ],
            }).then(connection => {
                console.log('DONE connecting!');
                this.conn = connection;
                this.ready = true;
                resolve(true);
            }).catch(error => console.log(error));
        });
    }
}
