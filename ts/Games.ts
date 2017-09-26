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
            if (currentArguments.length == 2) {
                var [ action, which ] = currentArguments;
                switch (action) {
                    case "delete":
                        if (window.confirm("Spiel löschen?")) {
                            this.getModel().localGames.remove(parseInt(which, 10) * 1);
                            this.getModel().syncGamesToStorage();
                        }
                        window.location.hash = "#games";
                        break
                }
            }
        }

        private refreshList() {
            let gameList = this.getContainer().find("#gamelist");
            let htmlArr = [];
            this.getModel().localGames.forEachReverse((dbGame, i, arr) => {
                let currentGameTemplate = this.oneGameTemplate.clone();
                currentGameTemplate.attr("data-gameID", i + "");
                currentGameTemplate.find(".title").text(dbGame.player);
                currentGameTemplate.find(".gameImage").attr("src", "img/" + dbGame.gameType + ".svg");
                currentGameTemplate.find(".group").text(dbGame.group);
                let won = currentGameTemplate.find(".wonText");
                if (dbGame.won) {
                    won.text("Gewonnen +" + dbGame.value);
                    currentGameTemplate.addClass("won");
                } else {
                    won.text("Verloren " + dbGame.value);
                    currentGameTemplate.addClass("lost");
                }

                currentGameTemplate.attr("onclick", "document.location.hash=\"#game_edit;" + i + "\"");
                currentGameTemplate.find(".delete").attr("onclick", "event.cancelBubble=true;document.location.hash=\"#games;delete;" + i + "\"");
                htmlArr.push(currentGameTemplate.wrap("<div></div>").parent().html());

                return true;
            });

            this.getModel().dbGames.forEachReverse((dbGame, i, arr) => {
                if (i > 100) {
                    return;
                }

                let currentGameTemplate = this.oneGameTemplate.clone();
                currentGameTemplate.attr("data-gameID", i + "");
                currentGameTemplate.find(".title").text(dbGame.player);
                currentGameTemplate.find(".gameImage").attr("src", "img/" + dbGame.gameType + ".svg");
                currentGameTemplate.find(".group").text(dbGame.group);
                currentGameTemplate.addClass("old")
                let won = currentGameTemplate.find(".wonText");
                if (dbGame.won) {
                    won.text("Gewonnen +" + dbGame.value);
                    currentGameTemplate.addClass("won");
                } else {
                    won.text("Verloren " + dbGame.value);
                    currentGameTemplate.addClass("lost");
                }

                currentGameTemplate.find(".delete").detach();
                currentGameTemplate.attr("onclick", "document.location.hash=\"#game_edit;" + i + ";view\"");

                htmlArr.push(currentGameTemplate.wrap("<div></div>").parent().html());
                return true;
            });

            gameList[ 0 ].innerHTML = htmlArr.join("");
        }

        private template: JQuery = this.buildTemplate("games");
        private oneGameTemplate = this.buildTemplate("game");


    }

}
