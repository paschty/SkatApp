namespace SkatApp {
    export class SkatApp {

        private skatAppModel:SkatAppModel = new SkatAppModel();
        private container:JQuery = jQuery("#skatAppMain");

        private pages = {
            "main" : new MainMenu(this.skatAppModel),
            "options" : new OptionMenu(this.skatAppModel),
            "players" : new Player(this.skatAppModel),
            "player_new" : new PlayerNew(this.skatAppModel),
            "games" : new Games(this.skatAppModel),
            "game_edit":new EditGame(this.skatAppModel)

        };

        private currentPage:Page = null;

        constructor() {
            this.init();
        }

        private init() {
            this.changePageTo(this.getCurrentPage());
            window.addEventListener("hashchange", (e)=> {
                this.changePageTo(this.getCurrentPage());
            });
        }

        private getCurrentPage() {
            let hash = window.location.hash.substr(1).split(";")[ 0 ];
            return (hash == "") ? "main" : hash;
        }

        private getCurrentArguments() {
            return window.location.hash.substr(1).split(";").slice(1);
        }


        private changePageTo(newPage:string) {
            if (this.currentPage != null) {
                this.currentPage.deactivate();
                this.currentPage.getContainer().detach();
            }
            this.currentPage = this.pages[ newPage ];
            this.currentPage.getContainer().appendTo(this.container);
            this.currentPage.activate(this.getCurrentArguments());
        }

    }

}


window.addEventListener("load", ()=> {
    window[ "skatApp" ] = new SkatApp.SkatApp();
});