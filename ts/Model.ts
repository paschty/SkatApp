namespace SkatApp {
    export interface SkatAppSettings {
        server: string;
    }

    export interface Game {
        group: string,
        player: string,
        bid: number,
        jacks: number,
        gameType: number,
        hand: boolean,
        gameLevel: number,
        announcement: number,
        won: boolean,
        value: number,
        createDate: number,
        modifyDate: number,
        points: number
    }

    export class SkatAppModel {

        private static SETTINGS = [ "server" ];
        public players: SAArrayList<string>;
        public groups: SAArrayList<string>;

        public localGames: SAArrayList<Game>;
        public dbGames: SAArrayList<Game>;
        private lastDBUpdate: Date;
        private lastDBPush: Date;
        public currentGame: Game = null;

        constructor() {
            this.init();
        }

        private init() {
            this.loadSettingsFromStorage();
            this.loadPlayersFromStorage();
            this.loadGamesFromStorage();
            this.loadDBGamesFromStorage();
            this.loadDBDatesFromStorage();
            this.loadGroupsFromStorage();

            let now = new Date();
            if (this.lastDBUpdate.getFullYear() != now.getFullYear() || this.lastDBUpdate.getMonth() != now.getMonth() || this.lastDBUpdate.getDate() != now.getDate()) {
                this.updateFromServer();

            }
        }

        public updateFromServer() {
            this.updatePlayerList();
            this.updateGameList();
            this.updateGroups();
        }

        private loadGroupsFromStorage() {
            let groupString = localStorage.getItem("groups");
            if (groupString != null) {
                this.groups = SAArrayList.fromJSON<string>(groupString);
            } else {
                this.groups = new SAArrayList<string>();
            }
        }

        private loadDBDatesFromStorage() {
            let lastDBUpdate: string, lastDBPush: string;
            if ((lastDBUpdate = localStorage.getItem("lastDBUpdate")) != null) {
                this.lastDBUpdate = new Date(parseInt(lastDBUpdate));
            } else {
                this.lastDBUpdate = new Date(0);
            }
            if ((lastDBPush = localStorage.getItem("lastDBPush")) != null) {
                this.lastDBPush = new Date(parseInt(lastDBPush));
            } else {
                this.lastDBPush = new Date(0);
            }
        }

        private loadPlayersFromStorage() {
            let playersString = localStorage.getItem("players");
            if (playersString != null) {
                this.players = SAArrayList.fromJSON<string>(playersString);
            } else {
                this.players = new SAArrayList<string>();
            }
        }


        private loadSettingsFromStorage() {
            let settingsObjectString: string;
            if ((settingsObjectString = localStorage.getItem("settings")) != null) {
                this.settingsObject = JSON.parse(settingsObjectString);
            } else {
                this.settingsObject = {server : null};
            }
        }

        private loadGamesFromStorage() {
            let gamesString = localStorage.getItem("localGames");
            if (gamesString != null) {
                this.localGames = SAArrayList.fromJSON<Game>(gamesString);
            } else {
                this.localGames = new SAArrayList<Game>();
            }
        }

        private loadDBGamesFromStorage() {
            let gamesString = localStorage.getItem("dbGames");
            if (gamesString != null) {
                this.dbGames = SAArrayList.fromJSON<Game>(gamesString);
            } else {
                this.dbGames = new SAArrayList<Game>();
            }
        }

        public syncGamesToStorage() {
            localStorage.setItem("localGames", this.localGames.toJSON());
        }

        public syncSettingsToStorage() {
            localStorage.setItem("settings", JSON.stringify(this.settingsObject));
        }

        private settingsObject: SkatAppSettings;


        public setDatabase(database: string) {
            this.settingsObject[ "server" ] = database;
            this.syncSettingsToStorage();
        }

        public getDatabase() {
            return this.settingsObject[ "server" ];
        }

        public updatePlayerList() {
            if (this.settingsObject.server != null && this.settingsObject.server.length > 0) {
                jQuery.ajax({
                    url : this.settingsObject.server + "/JSON/players", success : (result: Array<string>) => {
                        result.forEach((player) => {
                            if (this.players.indexOf(player) == -1) {
                                this.players.add(player);
                            }
                        });

                        localStorage.setItem("players", this.players.toJSON());
                    },
                    error : () => {
                        alert("Fehler beim Herunterladen der Spielerliste!");
                    }
                });
            }
        }

        public updateGroups() {
            if (this.settingsObject.server != null && this.settingsObject.server.length > 0) {
                jQuery.ajax({
                    url : this.settingsObject.server + "/JSON/groups", success : (result: Array<string>) => {
                        result.forEach((group) => {
                            if (this.groups.indexOf(group) == -1) {
                                this.groups.add(group);
                            }
                        });

                        localStorage.setItem("groups", this.groups.toJSON());
                    },
                    error : () => {
                        alert("Fehler beim Herunterladen der Gruppenliste!");
                    }
                });
            }
        }

        public updateGameList() {
            if (this.settingsObject.server != null && this.settingsObject.server.length > 0) {
                jQuery.ajax({
                    url : this.settingsObject.server + "/JSON/games", success : (result: Array<Game>) => {
                        this.dbGames.clear();
                        result.forEach((game) => {
                            this.dbGames.add(game);
                        });

                        localStorage.setItem("dbGames", this.dbGames.toJSON());
                        let lastUpdate = new Date();
                        localStorage.setItem("lastDBUpdate", lastUpdate.valueOf().toString());
                        this.lastDBUpdate = lastUpdate;
                    },
                    error : () => {
                        alert("Fehler beim Herunterladen der Spieleliste!");
                    }
                });
            }
        }

        public reset() {
            localStorage.clear();
            window.document.location.reload();
        }


    }
}
