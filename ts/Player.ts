namespace SkatApp {
    export class Player extends Page implements SALististener<string>{


        constructor(skatAppModel:SkatApp.SkatAppModel) {
            super(skatAppModel);
            this.template.appendTo(this.getContainer());
            this.init();
        }

        private onePlayerTemplate = this.buildTemplate("player");
        private template:JQuery = this.buildTemplate("players");

        public init() {

            this.getPlayerList().children().remove();

            this.getModel().players.forEach(player=> {
                this.addPlayer(player);

            });

            (<any>this.getModel().players.listeners).push(this);
        }

        private addPlayer(player) {
            let currentPlayerTemplate = this.onePlayerTemplate.clone();
            currentPlayerTemplate.find(".title").text(player);
            currentPlayerTemplate.find(".title").attr("data-player", player);
            this.getPlayerList().append(currentPlayerTemplate);
        }

        private getPlayerList() {
            return this.getContainer().find("#playerlist");
        }

        itemAdded(index:number, item:string) {
            this.addPlayer(item);
        }

        itemRemoved(lastIndex:number, item:string) {
            // ns
        }

        itemMoved(from:number, to:number) {
            // ns
        }

    }

}