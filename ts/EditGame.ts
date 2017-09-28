namespace SkatApp {
    export class EditGame extends Page {

        constructor(skatAppModel: SkatApp.SkatAppModel) {
            super(skatAppModel);
            this.template.clone().appendTo(this.getContainer());
        }

        private template: JQuery = this.buildTemplate("game_edit");
        private editedGame: Game;
        private currentRamsch: boolean = false;

        private gameLevelNormal = {
            "1" : "Normal (+1)",
            "2" : "Schneider (+2)",
            "3" : "Schwarz (+3)"
        };

        private gameLevelRamsch = {
            "-1" : "Normal",
            "-2" : "Jungfer (*-2)",
            "2" : "Durchmarsch"
        };

        private gameLevelHand = {
            "2" : "Hand (+2)",
            "3" : "Schneider (+3)",
            "4" : "Schneider angesagt (+4)",
            "5" : "Schwarz (+5)",
            "6" : "Schwarz angesagt (+6)",
            "7" : "Ouvert (+7)"
        };


        private view: boolean = false;

        activate(currentArguments: string[]) {
            console.log(currentArguments);

            let container = this.getContainer();
            let selects = (<any>container.find("select"));
            let model = this.getModel();

            selects.material_select('destroy');
            this.getContainer().find("input").removeAttr("disabled");

            let index = null;
            this.view = currentArguments.length == 2;
            if (currentArguments.length > 0) {
                index = ((<any>currentArguments[ 0 ]) * 1);
                model.currentGame = this.view ? model.dbGames.get(index) :  model.localGames.get(index);
            } else {
                model.currentGame = this.createNewGame();
            }

            let gui = jQuery()
                .add(this.getGameLevelElement())
                .add(this.getJacksElement())
                .add(this.getAnnouncementElement())
                .add(this.getHandElement())
                .add(this.getWonElement())
                .add(this.getGameTypeElement())
                .add(this.getGamePointsElement());

            let updateGUI = () => {
                // show all
                gui.closest(".row").show();
                this.updateGameLevel(this.getGameLevelElement().val());

                // ramsch
                if (this.getBidElement().val() == 0) {
                    jQuery()
                        .add(this.getHandElement().closest(".row"))
                        .add(this.getGameTypeElement().closest(".row"))
                        .add(this.getAnnouncementElement().closest(".row"))
                        .add(this.getJacksElement().closest(".row"))
                        .add(this.getWonElement().closest(".row"))
                        .hide();
                    //if(this.getGameLevelElement().val() != 2) {
                    jQuery().add(this.getGamePointsElement().closest(".row")).show();
                    /*} else {
                        jQuery().add(this.getGamePointsElement().closest(".row")).hide();
                    }*/
                } else {
                    jQuery().add(this.getGamePointsElement().closest(".row")).hide();
                }

                // null
                let gameType = this.getGameTypeElement().val();
                if ([ "23", "35", "46", "59" ].indexOf(gameType) >= 0) {
                    jQuery()
                        .add(this.getHandElement().closest(".row"))
                        .add(this.getGameLevelElement().closest(".row"))
                        .add(this.getJacksElement().closest(".row"))
                        .hide();
                }
            };

            jQuery()
                .add(this.getBidElement())
                .add(this.getGameTypeElement())
                .add(this.getHandElement())
                //.add(this.getGameLevelElement())
                .change(updateGUI);

            this.model2View(model);
            updateGUI();
            this.updateGamePoints();
            console.log(model.currentGame);
            selects.material_select();

            gui.change(() => {
                this.updateGamePoints();
            });

            this.getSaveGameButton().click(() => {
                if (!this.view) {
                    let game = this.gameFromView();

                    if (index == null) {
                        this.getModel().localGames.add(game);
                    } else {
                        this.getModel().localGames.remove(index);
                        this.getModel().localGames.add(game, index);
                    }

                    this.getModel().syncGamesToStorage();
                }
            });

            if (this.view) {
                this.getSaveGameButton().text("Zurück");
                this.deactivate();
                this.getContainer().find("input").attr("disabled", "true");
            } else {
                this.getSaveGameButton().text("Spiel Speichern");
            }
        }

        private getControls() {
            return jQuery()
                .add(this.getGameLevelElement())
                .add(this.getJacksElement())
                .add(this.getAnnouncementElement())
                .add(this.getHandElement())
                .add(this.getWonElement())
                .add(this.getGameTypeElement())
                .add(this.getGamePointsElement())
                .add(this.getSaveGameButton());
        }

        deactivate() {
            this.getControls().unbind();
        }

        private updateGameLevel(gameLevel: number) {
            let bid = parseInt(this.getBidElement().val(), 10);
            let gameLevelElement = this.getGameLevelElement();
            if (!this.currentRamsch && bid == 0) {
                this.fillGameLevel(gameLevelElement, this.gameLevelRamsch);
            } else if (bid != 0) {
                if (this.getHandElement().prop("checked")) {
                    this.fillGameLevel(gameLevelElement, this.gameLevelHand);
                } else {
                    this.fillGameLevel(gameLevelElement, this.gameLevelNormal);
                }
            }
            if (this.getGameLevelElement().find(`[value=${gameLevel}]`).val() != null) {
                this.getGameLevelElement().val(gameLevel);
            }
        }

        private fillGameLevel(gameLevelElement: JQuery, gameLevelObj: any) {
            (<any>jQuery(gameLevelElement)).material_select('destroy');
            gameLevelElement.children().remove();
            for (var value in gameLevelObj) {
                var text = gameLevelObj[ value ];
                jQuery("<option value='" + value + "'>" + text + "</option>").appendTo(gameLevelElement);
            }
            (<any>gameLevelElement).material_select();
            this.updateGamePoints();
        }

        private updateGamePoints() {
            jQuery("#gamePointsResult").text(this.getPoints(this.gameFromView()));
        }

        private model2View(model: SkatApp.SkatAppModel) {
            let currentGame = model.currentGame;
            let groupSelect = this.getGroupElement();
            groupSelect.children().remove();
            model.groups.forEach((group) => {
                jQuery("<option/>").text(group).attr("value", group).appendTo(groupSelect);
            });
            groupSelect.val(currentGame.group);
            this.getBidElement().val(currentGame.bid);

            let playerSelect = this.getPlayerElement();
            playerSelect.children().remove();
            model.players.forEach((player) => {
                jQuery("<option/>").text(player).attr("value", player).appendTo(playerSelect);
            });
            playerSelect.val(currentGame.player);

            this.getHandElement().prop("checked", currentGame.hand);
            this.getGameTypeElement().val(currentGame.gameType);
            this.getAnnouncementElement().val(currentGame.announcement);
            this.getJacksElement().val(currentGame.jacks);
            this.updateGameLevel(currentGame.gameLevel);
            this.getGamePointsElement().val(currentGame.bid != 0 ? currentGame.value :
                (currentGame.gameLevel != 2 ? currentGame.value * currentGame.gameLevel : 240));
            this.getWonElement().prop("checked", currentGame.won);

            return currentGame;
        }

        private getWonElement() {
            return this.getContainer().find("#won");
        }

        private gameFromView(): Game {
            let game = <Game>{
                group : this.getGroupElement().val(),
                bid : parseInt(this.getBidElement().val(), 10),
                player : this.getPlayerElement().val(),
                hand : this.getHandElement().prop("checked"),
                gameType : parseInt(this.getGameTypeElement().val(), 10),
                announcement : parseInt(this.getAnnouncementElement().val(), 10),
                gameLevel : parseInt(this.getGameLevelElement().val(), 10),
                jacks : parseInt(this.getJacksElement().val(), 10),
                won : this.getWonElement().prop("checked")
            };
            if (game.bid === 0) {
                game.won = game.gameLevel > 0;
            }
            game.value = this.getPoints(game);
            return game;
        }

        private getGroupElement() {
            return this.getContainer().find("#group");
        }

        private getBidElement() {
            return this.getContainer().find("#bid");
        }

        private getPlayerElement() {
            return this.getContainer().find("#player");
        }

        private getHandElement() {
            return this.getContainer().find("#hand");
        }

        private getGameTypeElement() {
            return this.getContainer().find("#gameType");
        }

        private getAnnouncementElement() {
            return this.getContainer().find("#announcement");
        }

        private getGameLevelElement() {
            return this.getContainer().find("#gameLevel");
        }

        private getJacksElement() {
            return this.getContainer().find("#jacks");
        }

        private getGamePointsElement() {
            return this.getContainer().find("#gamePoints");
        }

        private getSaveGameButton() {
            return this.getContainer().find("#saveGame");
        }

        private getPoints(game: Game): number {
            let gamePoints, gameType = game.gameType;
            if (game.bid == 0) {
                if (game.gameLevel === 2) {
                    // Durchmarsch
                    return 240;
                }
                return (<any>this.getGamePointsElement().val()) * game.gameLevel;
            } else if (gameType === 23 || gameType === 35 || gameType === 46 || gameType === 59) {
                gamePoints = gameType;
            } else {
                gamePoints = gameType * (game.jacks + game.gameLevel);
            }
            gamePoints *= game.announcement;
            if (!game.won) {
                gamePoints *= -2;
            }
            if (isNaN(gamePoints)) {
                throw "gamePoints is NaN";
            }
            return gamePoints;
        }


        private createNewGame() {
            let game = <Game>{};

            game.bid = 18;
            game.announcement = 1;
            game.createDate = new Date().getDate();
            game.gameLevel = 1;
            game.gameType = 9;
            game.group = this.getModel().groups.get(0);
            game.player = this.getModel().players.get(0);
            game.hand = false;
            game.jacks = 1;
            game.won = true;

            return game;
        }
    }
}
