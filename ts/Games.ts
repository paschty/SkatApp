namespace SkatApp {
    export class Games extends Page {

        constructor(skatAppModel: SkatApp.SkatAppModel) {
            super(skatAppModel);
            this.template.appendTo(this.getContainer());
            this.refreshList();

            let that = this;
            this.getModel().localGames.listeners.push(<any>{
                itemAdded : function (index: number, item: Game) {
                    that.refreshList();
                },
                itemRemoved : function (lastIndex: number, item: Game) {
                    that.refreshList();

                },
                itemMoved : function (from: number, to: number) {
                    that.refreshList();

                }
            });
        }

        activate(currentArguments: string[]) {
            window.scrollTo(0,0);
            let uploadGamesButton = this.getContainer().find("#uploadGames");
            this.getModel().localGames.size() > 0 ? uploadGamesButton.removeClass("disabled") :
                uploadGamesButton.addClass("disabled");
            if (currentArguments.length != 0) {
                let [ action, which ] = currentArguments;
                switch (action) {
                    case "delete":
                        if (window.confirm("Spiel löschen?")) {
                            this.getModel().localGames.remove(parseInt(which, 10) * 1);
                            this.getModel().syncGamesToStorage();
                        }
                        window.location.hash = "#games";
                        break;
                    case "upload":
                        let uploadDiv = this.getContainer().find("#uploadProgress");
                        uploadDiv.removeClass("hiddendiv");
                        uploadGamesButton.addClass("disabled");
                        this.getModel().upload().done(() => {
                            this.getModel().removeLocalGames();
                            this.getModel().updateGameList().always(() => {
                                alert("Upload erfolgreich!");
                                uploadDiv.addClass("hiddendiv");
                                this.refreshList();
                                window.location.hash = "#games";
                            });
                        })
                        .fail((error) => {
                           alert(error);
                            uploadDiv.addClass("hiddendiv");
                            window.location.hash = "#games";
                        });
                        break;
                }
            }
        }

        private refreshList() {
            let gameList = this.getContainer().find("#gamelist");
            let htmlArr = [];
            this.getModel().localGames.forEachReverse((dbGame, i, arr) => {
                let currentGameTemplate = this.renderGame(i, dbGame);
                currentGameTemplate.attr("onclick", "document.location.hash=\"#game_edit;" + i + "\"");
                currentGameTemplate.find(".delete").attr("onclick", "event.cancelBubble=true;document.location.hash=\"#games;delete;" + i + "\"");
                htmlArr.push(currentGameTemplate.wrap("<div></div>").parent().html());
                return true;
            });

            this.getModel().dbGames.forEachReverse((dbGame, i, arr) => {
                if (i < (arr.size() - 50)) {
                    return;
                }
                let currentGameTemplate = this.renderGame(i, dbGame);

                currentGameTemplate.addClass("old");
                currentGameTemplate.find(".delete").detach();
                currentGameTemplate.attr("onclick", "document.location.hash=\"#game_edit;" + i + ";view\"");

                htmlArr.push(currentGameTemplate.wrap("<div></div>").parent().html());
                return true;
            });

            gameList[ 0 ].innerHTML = htmlArr.join("");
        }

        private renderGame(i, dbGame) {
            let currentGameTemplate = this.oneGameTemplate.clone();
            currentGameTemplate.attr("data-gameID", i + "");
            currentGameTemplate.find(".title").text(dbGame.player);
            currentGameTemplate.find(".gameImage").attr("src", "img/" + dbGame.gameType + ".svg");
            currentGameTemplate.find(".group").text(dbGame.group);
            let modified = new Date(dbGame.modifyDate);
            currentGameTemplate.find(".modified").text(`${this.getDayAsString(modified)}.${this.getMonthAsString(modified)}.${modified.getFullYear()}`);
            let won = currentGameTemplate.find(".wonText");
            if (dbGame.won) {
                won.text("Gewonnen +" + dbGame.value);
                currentGameTemplate.addClass("won");
            } else {
                won.text("Verloren " + dbGame.value);
                currentGameTemplate.addClass("lost");
            }
            return currentGameTemplate;
        }

        private getMonthAsString(modified: Date) {
            return modified.getMonth() < 9 ? '0' + (modified.getMonth() + 1) : modified.getMonth() + 1;
        }

        private getDayAsString(modified: Date) {
            return modified.getDate() < 10 ? '0' + modified.getDate() : modified.getDate();
        }

        private template: JQuery = this.buildTemplate("games");
        private oneGameTemplate = this.buildTemplate("game");


    }

}
