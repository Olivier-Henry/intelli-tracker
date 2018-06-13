// import * as ini from 'ini';
import * as os from 'os';
import * as fs from 'fs';
// import { app } from 'electron';
import * as path from 'path';
import { getConnection } from 'typeorm';
import Room from '../entity/Room';
import User from '../entity/User';
import AppPreferences from '../entity/AppPreferences';

export default class Config {

    os: string;
    version: number;
    rooms: { [k: string]: string } = {};
    assistant = true;
    // initPath: string;

    constructor() {
        /*  this.initPath = path.join(app.getPath('userData'), 'tm-config.ini'); */
        this.initialize();
    }


    initialize() {
        // if (!fs.existsSync(this.initPath)) {
        //     this.assistant = true;
        this.detectOsVersion();
        this.generateDefaultRoomPaths();
        // this.createIniFile();
        this.saveRoomsAndHeroes();
        // }
        this.getPreferences()
            .then(result => {
                console.log('getPreferences', result);
            })
            .catch(error => {
                console.error(error);
            });


        // return ini.parse(fs.readFileSync(this.initPath, 'utf-8'));
    }

    private async getPreferences() {
        const preferencesRepository = getConnection().getRepository(AppPreferences);
        const _this = this;
        return await preferencesRepository.findOne({ firstInstall: false })
            .then(result => {
                if (result instanceof AppPreferences) {
                    return result.firstInstall;
                }

                const prefs = new AppPreferences();
                prefs.firstInstall = _this.assistant;
                preferencesRepository.save(prefs).then(savedPref => {
                    // do nothing
                }).catch(error => {
                    console.warn(error);
                });

                return prefs.firstInstall;

            }).catch(error => {
                console.error(error);
            });
    }

    generateDefaultRoomPaths() {
        switch (this.os) {
            case 'win32':
                if (this.version >= 7) {
                    this.rooms.winamax = os.homedir() + path.sep + 'Documents' + path.sep + 'Winamax Poker' + path.sep + 'accounts';
                    this.rooms.pokerstars = os.homedir() + path.sep + 'AppData' + path.sep
                        + 'Local' + path.sep + 'PokerStars.FR' + path.sep + 'HandHistory';
                }
                break;
            case 'darwin':
                this.rooms.winamax = os.homedir() + path.sep + 'Documents' + path.sep + 'Winamax Poker' + path.sep + 'accounts';
                this.rooms.pokerstars = '/Library/Application Support/PokerStars.FR/HandHistory';
                break;
            default:

                break;
        }
    }

    private saveRoomsAndHeroes() {
        for (const room of Object.keys(this.rooms)) {
            this.saveRooms(room);
        }
    }

    public saveRooms(room: string) {
        console.log(room);
        const _this = this;
        const roomRepository = getConnection().getRepository(Room);
        fs.stat(this.rooms[room], function (err) {
            if (err === null) {

                roomRepository.findOne({
                    name: room
                }).then(result => {
                    let r = new Room();

                    if (result instanceof Room) {
                        r = result;
                        _this.saveHeroes(r);
                        return;
                    }

                    r.name = room;
                    r.path = _this.rooms[room];
                    roomRepository.save(r).then(roomResult => {
                        _this.saveHeroes(roomResult);
                    }).catch(error => {
                        console.error(error);
                    });
                }).catch(error => {
                    console.error(room, error);
                });



            } else {
                console.error('default path was not found for room: ' + room);
            }
        });
    }

    public saveHeroes(room: Room): void {

        const userRepository = getConnection().getRepository(User);

        fs.readdir(room.path, (err, files) => {
            files.forEach(file => {
                const filePath = room.path + path.sep + file;
                fs.stat(filePath, (error, stats) => {
                    if (stats.isDirectory()) {

                        const user = new User();
                        user.name = file;
                        user.room = room;
                        user.isHero = true;

                        userRepository.findOne({ name: user.name, roomId: room.id }).then(result => {
                            console.log(result);
                            if (result instanceof User) {
                                console.log('ici');
                                return;
                            }

                            userRepository.save(user).then(userId => {
                                // do nothing
                            }).catch(userError => {
                                console.warn(userError);
                            });


                        }).catch(repositoryError => {
                            console.warn(repositoryError);
                        });

                    }
                });
                console.log(file);
            });
        });

    }

    /* createIniFile() {

        let _this = this;

        fs.writeFileSync(this.initPath, ini.stringify(_this.getProperties()), (err) => {
            if (err) {
                return console.log(err);
            }

        });
    } */
    /*  getProperties() {
         return {
             os: this.os,
             version: this.version,
             rooms: this.rooms,
             assistant: this.assistant
         };
     } */
    /*  getOsUser() {
         return os.userInfo().username;
     } */

    detectOsVersion() {
        this.os = os.platform();
        this.version = parseInt(os.release().split('.')[0], 10);
    }
}

