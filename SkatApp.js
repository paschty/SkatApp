var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var SkatApp;
(function (SkatApp) {
    var SAArrayList = (function () {
        function SAArrayList() {
            this.base = new Array();
            this.listeners = new Array();
        }
        SAArrayList.prototype.add = function (item, index) {
            if (index === void 0) { index = this.base.length; }
            this.base.splice(index, 0, item);
            this.listeners.forEach(function (listener) {
                listener.itemAdded(index, item);
            });
        };
        SAArrayList.prototype.removeFirst = function (item) {
            var position = this.base.indexOf(item);
            if (position != -1) {
                return this.remove(position);
            }
        };
        SAArrayList.prototype.remove = function (index) {
            var removed = this.base.splice(index, 1)[0];
            this.listeners.forEach(function (listener) {
                listener.itemRemoved(index, removed);
            });
            return removed;
        };
        SAArrayList.prototype.size = function () {
            return this.base.length;
        };
        SAArrayList.prototype.forEach = function (fn) {
            var _this = this;
            this.base.forEach(function (e, i) {
                fn(e, i, _this);
            });
        };
        SAArrayList.prototype.forEachReverse = function (fn) {
            var length = this.base.length - 1;
            for (var i = length; i >= 0; i--) {
                fn(this.base[i], i, this);
            }
        };
        SAArrayList.prototype.indexOf = function (element) {
            return this.base.indexOf(element);
        };
        SAArrayList.prototype.toJSON = function () {
            return JSON.stringify(this.base);
        };
        SAArrayList.prototype.clear = function () {
            var _this = this;
            var oldBase = this.base;
            this.base = [];
            oldBase.forEach(function (element, position) {
                _this.listeners.forEach(function (listener) {
                    listener.itemRemoved(position, element);
                });
            });
        };
        SAArrayList.prototype.get = function (index) {
            return this.base[index];
        };
        SAArrayList.fromJSON = function (json) {
            var list = new SAArrayList();
            list.base = JSON.parse(json);
            return list;
        };
        return SAArrayList;
    }());
    SkatApp.SAArrayList = SAArrayList;
})(SkatApp || (SkatApp = {}));
var SkatApp;
(function (SkatApp) {
    var SkatAppModel = (function () {
        function SkatAppModel() {
            this.currentGame = null;
            this.init();
        }
        SkatAppModel.prototype.init = function () {
            this.loadSettingsFromStorage();
            this.loadPlayersFromStorage();
            this.loadGamesFromStorage();
            this.loadDBGamesFromStorage();
            this.loadDBDatesFromStorage();
            this.loadGroupsFromStorage();
            var now = new Date();
            if (this.lastDBUpdate.getFullYear() != now.getFullYear() || this.lastDBUpdate.getMonth() != now.getMonth() || this.lastDBUpdate.getDate() != now.getDate()) {
                this.updateFromServer();
            }
        };
        SkatAppModel.prototype.updateFromServer = function () {
            this.updatePlayerList();
            this.updateGameList();
            this.updateGroups();
        };
        SkatAppModel.prototype.loadGroupsFromStorage = function () {
            var groupString = localStorage.getItem("groups");
            if (groupString != null) {
                this.groups = SkatApp.SAArrayList.fromJSON(groupString);
            }
            else {
                this.groups = new SkatApp.SAArrayList();
            }
        };
        SkatAppModel.prototype.loadDBDatesFromStorage = function () {
            var lastDBUpdate, lastDBPush;
            if ((lastDBUpdate = localStorage.getItem("lastDBUpdate")) != null) {
                this.lastDBUpdate = new Date(parseInt(lastDBUpdate));
            }
            else {
                this.lastDBUpdate = new Date(0);
            }
            if ((lastDBPush = localStorage.getItem("lastDBPush")) != null) {
                this.lastDBPush = new Date(parseInt(lastDBPush));
            }
            else {
                this.lastDBPush = new Date(0);
            }
        };
        SkatAppModel.prototype.loadPlayersFromStorage = function () {
            var playersString = localStorage.getItem("players");
            if (playersString != null) {
                this.players = SkatApp.SAArrayList.fromJSON(playersString);
            }
            else {
                this.players = new SkatApp.SAArrayList();
            }
        };
        SkatAppModel.prototype.loadSettingsFromStorage = function () {
            var settingsObjectString;
            if ((settingsObjectString = localStorage.getItem("settings")) != null) {
                this.settingsObject = JSON.parse(settingsObjectString);
            }
            else {
                this.settingsObject = { server: null };
            }
        };
        SkatAppModel.prototype.loadGamesFromStorage = function () {
            var gamesString = localStorage.getItem("localGames");
            if (gamesString != null) {
                this.localGames = SkatApp.SAArrayList.fromJSON(gamesString);
            }
            else {
                this.localGames = new SkatApp.SAArrayList();
            }
        };
        SkatAppModel.prototype.loadDBGamesFromStorage = function () {
            var gamesString = localStorage.getItem("dbGames");
            if (gamesString != null) {
                this.dbGames = SkatApp.SAArrayList.fromJSON(gamesString);
            }
            else {
                this.dbGames = new SkatApp.SAArrayList();
            }
        };
        SkatAppModel.prototype.syncGamesToStorage = function () {
            localStorage.setItem("localGames", this.localGames.toJSON());
        };
        SkatAppModel.prototype.syncSettingsToStorage = function () {
            localStorage.setItem("settings", JSON.stringify(this.settingsObject));
        };
        SkatAppModel.prototype.setDatabase = function (database) {
            this.settingsObject["server"] = database;
            this.syncSettingsToStorage();
        };
        SkatAppModel.prototype.getDatabase = function () {
            return this.settingsObject["server"];
        };
        SkatAppModel.prototype.updatePlayerList = function () {
            var _this = this;
            if (this.settingsObject.server != null && this.settingsObject.server.length > 0) {
                jQuery.ajax({
                    url: this.settingsObject.server + "/JSON/players", success: function (result) {
                        result.forEach(function (player) {
                            if (_this.players.indexOf(player) == -1) {
                                _this.players.add(player);
                            }
                        });
                        localStorage.setItem("players", _this.players.toJSON());
                    },
                    error: function () {
                        alert("Fehler beim Herunterladen der Spielerliste!");
                    }
                });
            }
        };
        SkatAppModel.prototype.updateGroups = function () {
            var _this = this;
            if (this.settingsObject.server != null && this.settingsObject.server.length > 0) {
                jQuery.ajax({
                    url: this.settingsObject.server + "/JSON/groups", success: function (result) {
                        result.forEach(function (group) {
                            if (_this.groups.indexOf(group) == -1) {
                                _this.groups.add(group);
                            }
                        });
                        localStorage.setItem("groups", _this.groups.toJSON());
                    },
                    error: function () {
                        alert("Fehler beim Herunterladen der Gruppenliste!");
                    }
                });
            }
        };
        SkatAppModel.prototype.updateGameList = function () {
            var _this = this;
            if (this.settingsObject.server == null || this.settingsObject.server.length <= 0) {
                return $.Deferred(function (dfd) { return dfd.reject('Server nicht konfiguriert!'); }).promise();
            }
            return jQuery.ajax({
                url: this.settingsObject.server + "/JSON/games", success: function (result) {
                    _this.dbGames.clear();
                    result.forEach(function (game) {
                        _this.dbGames.add(game);
                    });
                    localStorage.setItem("dbGames", _this.dbGames.toJSON());
                    var lastUpdate = new Date();
                    localStorage.setItem("lastDBUpdate", lastUpdate.valueOf().toString());
                    _this.lastDBUpdate = lastUpdate;
                },
                error: function () {
                    alert("Fehler beim aktualisieren der Spieleliste!");
                }
            });
        };
        SkatAppModel.prototype.upload = function () {
            if (this.settingsObject.server == null || this.settingsObject.server.length <= 0) {
                return $.Deferred(function (dfd) { return dfd.reject('Server nicht konfiguriert!'); }).promise();
            }
            return jQuery.ajax({
                url: this.settingsObject.server + "/JSON/games",
                type: 'POST',
                crossDomain: true,
                data: {
                    games: this.localGames.toJSON()
                },
                dataType: 'json'
            });
        };
        SkatAppModel.prototype.removeLocalGames = function () {
            this.localGames.clear();
            this.syncGamesToStorage();
        };
        SkatAppModel.prototype.reset = function () {
            localStorage.clear();
            window.document.location.reload();
        };
        return SkatAppModel;
    }());
    SkatApp.SkatAppModel = SkatAppModel;
})(SkatApp || (SkatApp = {}));
var SkatApp;
(function (SkatApp) {
    var Page = (function () {
        function Page(skatAppModel) {
            this.skatAppModel = skatAppModel;
            this.container = jQuery("<section />");
            this.container.addClass("page");
        }
        Page.prototype.getModel = function () {
            return this.skatAppModel;
        };
        Page.prototype.getContainer = function () {
            return this.container;
        };
        Page.prototype.buildTemplate = function (id) {
            return jQuery(jQuery("#" + id).detach().html());
        };
        Page.prototype.setArguments = function (strings) {
            this.arguments = strings;
        };
        Page.prototype.activate = function (currentArguments) {
        };
        Page.prototype.deactivate = function () {
        };
        return Page;
    }());
    SkatApp.Page = Page;
})(SkatApp || (SkatApp = {}));
var SkatApp;
(function (SkatApp) {
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(skatAppModel) {
            _super.call(this, skatAppModel);
            this.onePlayerTemplate = this.buildTemplate("player");
            this.template = this.buildTemplate("players");
            this.template.appendTo(this.getContainer());
            this.init();
        }
        Player.prototype.init = function () {
            var _this = this;
            this.getPlayerList().children().remove();
            this.getModel().players.forEach(function (player) {
                _this.addPlayer(player);
            });
            this.getModel().players.listeners.push(this);
        };
        Player.prototype.addPlayer = function (player) {
            var currentPlayerTemplate = this.onePlayerTemplate.clone();
            currentPlayerTemplate.find(".title").text(player);
            currentPlayerTemplate.find(".title").attr("data-player", player);
            this.getPlayerList().append(currentPlayerTemplate);
        };
        Player.prototype.getPlayerList = function () {
            return this.getContainer().find("#playerlist");
        };
        Player.prototype.itemAdded = function (index, item) {
            this.addPlayer(item);
        };
        Player.prototype.itemRemoved = function (lastIndex, item) {
        };
        Player.prototype.itemMoved = function (from, to) {
        };
        return Player;
    }(SkatApp.Page));
    SkatApp.Player = Player;
})(SkatApp || (SkatApp = {}));
var SkatApp;
(function (SkatApp) {
    var PlayerNew = (function (_super) {
        __extends(PlayerNew, _super);
        function PlayerNew(skatAppModel) {
            _super.call(this, skatAppModel);
            this.template = this.buildTemplate("player_new");
            this.template.appendTo(this.getContainer());
            this.init();
        }
        PlayerNew.prototype.init = function () {
            var _this = this;
            this.getContainer().find("#newPlayerName").keyup(function () {
                _this.validatePlayerName();
            });
            this.getContainer().find("#addPlayer").click(function (e) {
                if (_this.validatePlayerName()) {
                    _this.getModel().players.add(_this.getPlayerNameFromForm());
                }
                else {
                    e.preventDefault();
                }
            });
        };
        PlayerNew.prototype.getPlayerNameFromForm = function () {
            return this.getContainer().find("#newPlayerName").val().trim();
        };
        PlayerNew.prototype.validatePlayerName = function () {
            var valid = this.getModel().players.indexOf(this.getPlayerNameFromForm()) == -1;
            if (valid) {
                this.getContainer().find("#newPlayerName").removeClass("invalid");
                this.getContainer().find("#newPlayerName").addClass("validate");
            }
            else {
                this.getContainer().find("#newPlayerName").removeClass("validate");
                this.getContainer().find("#newPlayerName").addClass("invalid");
            }
            return valid;
        };
        return PlayerNew;
    }(SkatApp.Page));
    SkatApp.PlayerNew = PlayerNew;
})(SkatApp || (SkatApp = {}));
var SkatApp;
(function (SkatApp) {
    var Games = (function (_super) {
        __extends(Games, _super);
        function Games(skatAppModel) {
            _super.call(this, skatAppModel);
            this.template = this.buildTemplate("games");
            this.oneGameTemplate = this.buildTemplate("game");
            this.template.appendTo(this.getContainer());
            this.refreshList();
            var that = this;
            this.getModel().localGames.listeners.push({
                itemAdded: function (index, item) {
                    that.refreshList();
                },
                itemRemoved: function (lastIndex, item) {
                    that.refreshList();
                },
                itemMoved: function (from, to) {
                    that.refreshList();
                }
            });
        }
        Games.prototype.activate = function (currentArguments) {
            var _this = this;
            window.scrollTo(0, 0);
            var uploadGamesButton = this.getContainer().find("#uploadGames");
            this.getModel().localGames.size() > 0 ? uploadGamesButton.removeClass("disabled") :
                uploadGamesButton.addClass("disabled");
            if (currentArguments.length != 0) {
                var action = currentArguments[0], which = currentArguments[1];
                switch (action) {
                    case "delete":
                        if (window.confirm("Spiel löschen?")) {
                            this.getModel().localGames.remove(parseInt(which, 10) * 1);
                            this.getModel().syncGamesToStorage();
                        }
                        window.location.hash = "#games";
                        break;
                    case "upload":
                        var uploadDiv_1 = this.getContainer().find("#uploadProgress");
                        uploadDiv_1.removeClass("hiddendiv");
                        uploadGamesButton.addClass("disabled");
                        this.getModel().upload().done(function () {
                            _this.getModel().removeLocalGames();
                            _this.getModel().updateGameList().always(function () {
                                alert("Upload erfolgreich!");
                                uploadDiv_1.addClass("hiddendiv");
                                _this.refreshList();
                                window.location.hash = "#games";
                            });
                        })
                            .fail(function (error) {
                            alert(error);
                            uploadDiv_1.addClass("hiddendiv");
                            window.location.hash = "#games";
                        });
                        break;
                }
            }
        };
        Games.prototype.refreshList = function () {
            var _this = this;
            var gameList = this.getContainer().find("#gamelist");
            var htmlArr = [];
            this.getModel().localGames.forEachReverse(function (dbGame, i, arr) {
                var currentGameTemplate = _this.oneGameTemplate.clone();
                currentGameTemplate.attr("data-gameID", i + "");
                currentGameTemplate.find(".title").text(dbGame.player);
                currentGameTemplate.find(".gameImage").attr("src", "img/" + dbGame.gameType + ".svg");
                currentGameTemplate.find(".group").text(dbGame.group);
                var won = currentGameTemplate.find(".wonText");
                if (dbGame.won) {
                    won.text("Gewonnen +" + dbGame.value);
                    currentGameTemplate.addClass("won");
                }
                else {
                    won.text("Verloren " + dbGame.value);
                    currentGameTemplate.addClass("lost");
                }
                currentGameTemplate.attr("onclick", "document.location.hash=\"#game_edit;" + i + "\"");
                currentGameTemplate.find(".delete").attr("onclick", "event.cancelBubble=true;document.location.hash=\"#games;delete;" + i + "\"");
                htmlArr.push(currentGameTemplate.wrap("<div></div>").parent().html());
                return true;
            });
            this.getModel().dbGames.forEachReverse(function (dbGame, i, arr) {
                if (i < (arr.size() - 50)) {
                    return;
                }
                var currentGameTemplate = _this.oneGameTemplate.clone();
                currentGameTemplate.attr("data-gameID", i + "");
                currentGameTemplate.find(".title").text(dbGame.player);
                currentGameTemplate.find(".gameImage").attr("src", "img/" + dbGame.gameType + ".svg");
                currentGameTemplate.find(".group").text(dbGame.group);
                currentGameTemplate.addClass("old");
                var won = currentGameTemplate.find(".wonText");
                if (dbGame.won) {
                    won.text("Gewonnen +" + dbGame.value);
                    currentGameTemplate.addClass("won");
                }
                else {
                    won.text("Verloren " + dbGame.value);
                    currentGameTemplate.addClass("lost");
                }
                currentGameTemplate.find(".delete").detach();
                currentGameTemplate.attr("onclick", "document.location.hash=\"#game_edit;" + i + ";view\"");
                htmlArr.push(currentGameTemplate.wrap("<div></div>").parent().html());
                return true;
            });
            gameList[0].innerHTML = htmlArr.join("");
        };
        return Games;
    }(SkatApp.Page));
    SkatApp.Games = Games;
})(SkatApp || (SkatApp = {}));
var SkatApp;
(function (SkatApp) {
    var EditGame = (function (_super) {
        __extends(EditGame, _super);
        function EditGame(skatAppModel) {
            _super.call(this, skatAppModel);
            this.template = this.buildTemplate("game_edit");
            this.currentRamsch = false;
            this.gameLevelNormal = {
                "1": "Normal (+1)",
                "2": "Schneider (+2)",
                "3": "Schwarz (+3)"
            };
            this.gameLevelRamsch = {
                "-1": "Normal",
                "-2": "Jungfer (*-2)",
                "2": "Durchmarsch"
            };
            this.gameLevelHand = {
                "2": "Hand (+2)",
                "3": "Schneider (+3)",
                "4": "Schneider angesagt (+4)",
                "5": "Schwarz (+5)",
                "6": "Schwarz angesagt (+6)",
                "7": "Ouvert (+7)"
            };
            this.view = false;
            this.template.clone().appendTo(this.getContainer());
        }
        EditGame.prototype.activate = function (currentArguments) {
            var _this = this;
            console.log(currentArguments);
            var container = this.getContainer();
            var selects = container.find("select");
            var model = this.getModel();
            selects.material_select('destroy');
            this.getContainer().find("input").removeAttr("disabled");
            var index = null;
            this.view = currentArguments.length == 2;
            if (currentArguments.length > 0) {
                index = (currentArguments[0] * 1);
                model.currentGame = this.view ? model.dbGames.get(index) : model.localGames.get(index);
            }
            else {
                model.currentGame = this.createNewGame();
            }
            var gui = jQuery()
                .add(this.getGameLevelElement())
                .add(this.getJacksElement())
                .add(this.getAnnouncementElement())
                .add(this.getHandElement())
                .add(this.getWonElement())
                .add(this.getGameTypeElement())
                .add(this.getGamePointsElement());
            var updateGUI = function () {
                gui.closest(".row").show();
                _this.updateGameLevel(_this.getGameLevelElement().val());
                if (_this.getBidElement().val() == 0) {
                    jQuery()
                        .add(_this.getHandElement().closest(".row"))
                        .add(_this.getGameTypeElement().closest(".row"))
                        .add(_this.getAnnouncementElement().closest(".row"))
                        .add(_this.getJacksElement().closest(".row"))
                        .add(_this.getWonElement().closest(".row"))
                        .hide();
                    jQuery().add(_this.getGamePointsElement().closest(".row")).show();
                }
                else {
                    jQuery().add(_this.getGamePointsElement().closest(".row")).hide();
                }
                var gameType = _this.getGameTypeElement().val();
                if (["23", "35", "46", "59"].indexOf(gameType) >= 0) {
                    jQuery()
                        .add(_this.getHandElement().closest(".row"))
                        .add(_this.getGameLevelElement().closest(".row"))
                        .add(_this.getJacksElement().closest(".row"))
                        .hide();
                }
            };
            jQuery()
                .add(this.getBidElement())
                .add(this.getGameTypeElement())
                .add(this.getHandElement())
                .change(updateGUI);
            this.model2View(model);
            updateGUI();
            this.updateGamePoints();
            console.log(model.currentGame);
            selects.material_select();
            gui.change(function () {
                _this.updateGamePoints();
            });
            this.getSaveGameButton().click(function () {
                if (!_this.view) {
                    var game = _this.gameFromView();
                    if (index == null) {
                        _this.getModel().localGames.add(game);
                    }
                    else {
                        _this.getModel().localGames.remove(index);
                        _this.getModel().localGames.add(game, index);
                    }
                    _this.getModel().syncGamesToStorage();
                }
            });
            if (this.view) {
                this.getSaveGameButton().text("Zurück");
                this.deactivate();
                this.getContainer().find("input").attr("disabled", "true");
            }
            else {
                this.getSaveGameButton().text("Spiel Speichern");
            }
        };
        EditGame.prototype.getControls = function () {
            return jQuery()
                .add(this.getGameLevelElement())
                .add(this.getJacksElement())
                .add(this.getAnnouncementElement())
                .add(this.getHandElement())
                .add(this.getWonElement())
                .add(this.getGameTypeElement())
                .add(this.getGamePointsElement())
                .add(this.getSaveGameButton());
        };
        EditGame.prototype.deactivate = function () {
            this.getControls().unbind();
        };
        EditGame.prototype.updateGameLevel = function (gameLevel) {
            var bid = parseInt(this.getBidElement().val(), 10);
            var gameLevelElement = this.getGameLevelElement();
            if (!this.currentRamsch && bid == 0) {
                this.fillGameLevel(gameLevelElement, this.gameLevelRamsch);
            }
            else if (bid != 0) {
                if (this.getHandElement().prop("checked")) {
                    this.fillGameLevel(gameLevelElement, this.gameLevelHand);
                }
                else {
                    this.fillGameLevel(gameLevelElement, this.gameLevelNormal);
                }
            }
            if (this.getGameLevelElement().find("[value=" + gameLevel + "]").val() != null) {
                this.getGameLevelElement().val(gameLevel);
            }
        };
        EditGame.prototype.fillGameLevel = function (gameLevelElement, gameLevelObj) {
            jQuery(gameLevelElement).material_select('destroy');
            gameLevelElement.children().remove();
            for (var value in gameLevelObj) {
                var text = gameLevelObj[value];
                jQuery("<option value='" + value + "'>" + text + "</option>").appendTo(gameLevelElement);
            }
            gameLevelElement.material_select();
            this.updateGamePoints();
        };
        EditGame.prototype.updateGamePoints = function () {
            jQuery("#gamePointsResult").text(this.getPoints(this.gameFromView()));
        };
        EditGame.prototype.model2View = function (model) {
            var currentGame = model.currentGame;
            var groupSelect = this.getGroupElement();
            groupSelect.children().remove();
            model.groups.forEach(function (group) {
                jQuery("<option/>").text(group).attr("value", group).appendTo(groupSelect);
            });
            groupSelect.val(currentGame.group);
            this.getBidElement().val(currentGame.bid);
            var playerSelect = this.getPlayerElement();
            playerSelect.children().remove();
            model.players.forEach(function (player) {
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
        };
        EditGame.prototype.getWonElement = function () {
            return this.getContainer().find("#won");
        };
        EditGame.prototype.gameFromView = function () {
            var game = {
                group: this.getGroupElement().val(),
                bid: parseInt(this.getBidElement().val(), 10),
                player: this.getPlayerElement().val(),
                hand: this.getHandElement().prop("checked"),
                gameType: parseInt(this.getGameTypeElement().val(), 10),
                announcement: parseInt(this.getAnnouncementElement().val(), 10),
                gameLevel: parseInt(this.getGameLevelElement().val(), 10),
                jacks: parseInt(this.getJacksElement().val(), 10),
                won: this.getWonElement().prop("checked")
            };
            if (game.bid === 0) {
                game.won = game.gameLevel > 0;
            }
            game.value = this.getPoints(game);
            return game;
        };
        EditGame.prototype.getGroupElement = function () {
            return this.getContainer().find("#group");
        };
        EditGame.prototype.getBidElement = function () {
            return this.getContainer().find("#bid");
        };
        EditGame.prototype.getPlayerElement = function () {
            return this.getContainer().find("#player");
        };
        EditGame.prototype.getHandElement = function () {
            return this.getContainer().find("#hand");
        };
        EditGame.prototype.getGameTypeElement = function () {
            return this.getContainer().find("#gameType");
        };
        EditGame.prototype.getAnnouncementElement = function () {
            return this.getContainer().find("#announcement");
        };
        EditGame.prototype.getGameLevelElement = function () {
            return this.getContainer().find("#gameLevel");
        };
        EditGame.prototype.getJacksElement = function () {
            return this.getContainer().find("#jacks");
        };
        EditGame.prototype.getGamePointsElement = function () {
            return this.getContainer().find("#gamePoints");
        };
        EditGame.prototype.getSaveGameButton = function () {
            return this.getContainer().find("#saveGame");
        };
        EditGame.prototype.getPoints = function (game) {
            var gamePoints, gameType = game.gameType;
            if (game.bid == 0) {
                if (game.gameLevel === 2) {
                    return 240;
                }
                return this.getGamePointsElement().val() * game.gameLevel;
            }
            else if (gameType === 23 || gameType === 35 || gameType === 46 || gameType === 59) {
                gamePoints = gameType;
            }
            else {
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
        };
        EditGame.prototype.createNewGame = function () {
            var game = {};
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
        };
        return EditGame;
    }(SkatApp.Page));
    SkatApp.EditGame = EditGame;
})(SkatApp || (SkatApp = {}));
var SkatApp;
(function (SkatApp) {
    var MainMenu = (function (_super) {
        __extends(MainMenu, _super);
        function MainMenu(skatAppModel) {
            _super.call(this, skatAppModel);
            this.template = this.buildTemplate("main");
            this.template.appendTo(this.getContainer());
        }
        return MainMenu;
    }(SkatApp.Page));
    SkatApp.MainMenu = MainMenu;
})(SkatApp || (SkatApp = {}));
var SkatApp;
(function (SkatApp) {
    var OptionMenu = (function (_super) {
        __extends(OptionMenu, _super);
        function OptionMenu(skatAppModel) {
            _super.call(this, skatAppModel);
            this.template = this.buildTemplate("options");
            this.template.appendTo(this.getContainer());
            this.initEvents();
        }
        OptionMenu.prototype.initEvents = function () {
            var _this = this;
            this.getContainer().find("#test").click(function () {
                var testDB = _this.getDBFromForm();
                _this.testDatabase(testDB);
            });
            this.getContainer().find("#save").click(function () {
                _this.getModel().setDatabase(_this.getDBFromForm());
                _this.getModel().updateFromServer();
            });
            this.getContainer().find("#reset").click(function () {
                var reset = window.confirm("Reset?");
                if (reset) {
                    _this.getModel().reset();
                }
            });
            this.getContainer().find("#skatDB").val(this.getModel().getDatabase());
        };
        OptionMenu.prototype.getDBFromForm = function () {
            return this.getContainer().find("#skatDB").val();
        };
        OptionMenu.prototype.testDatabase = function (testDB) {
            jQuery.ajax({
                url: testDB + "/JSON/players", success: function (result) {
                    alert("Test erfolgreich!");
                },
                error: function () {
                    alert("Test fehlgeschlagen!");
                }
            });
        };
        return OptionMenu;
    }(SkatApp.Page));
    SkatApp.OptionMenu = OptionMenu;
})(SkatApp || (SkatApp = {}));
var SkatApp;
(function (SkatApp_1) {
    var SkatApp = (function () {
        function SkatApp() {
            this.skatAppModel = new SkatApp_1.SkatAppModel();
            this.container = jQuery("#skatAppMain");
            this.pages = {
                "main": new SkatApp_1.MainMenu(this.skatAppModel),
                "options": new SkatApp_1.OptionMenu(this.skatAppModel),
                "players": new SkatApp_1.Player(this.skatAppModel),
                "player_new": new SkatApp_1.PlayerNew(this.skatAppModel),
                "games": new SkatApp_1.Games(this.skatAppModel),
                "game_edit": new SkatApp_1.EditGame(this.skatAppModel)
            };
            this.currentPage = null;
            this.init();
        }
        SkatApp.prototype.init = function () {
            var _this = this;
            this.changePageTo(this.getCurrentPage());
            window.addEventListener("hashchange", function (e) {
                _this.changePageTo(_this.getCurrentPage());
            });
        };
        SkatApp.prototype.getCurrentPage = function () {
            var hash = window.location.hash.substr(1).split(";")[0];
            return (hash == "") ? "main" : hash;
        };
        SkatApp.prototype.getCurrentArguments = function () {
            return window.location.hash.substr(1).split(";").slice(1);
        };
        SkatApp.prototype.changePageTo = function (newPage) {
            if (this.currentPage != null) {
                this.currentPage.deactivate();
                this.currentPage.getContainer().detach();
            }
            this.currentPage = this.pages[newPage];
            this.currentPage.getContainer().appendTo(this.container);
            this.currentPage.activate(this.getCurrentArguments());
        };
        return SkatApp;
    }());
    SkatApp_1.SkatApp = SkatApp;
})(SkatApp || (SkatApp = {}));
window.addEventListener("load", function () {
    window["skatApp"] = new SkatApp.SkatApp();
    window.applicationCache.addEventListener('updateready', function (e) {
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
            window.applicationCache.swapCache();
            window.location.reload();
        }
        else {
        }
    });
});
