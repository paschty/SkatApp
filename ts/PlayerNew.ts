namespace SkatApp {
    export class PlayerNew extends Page {

        constructor(skatAppModel:SkatApp.SkatAppModel) {
            super(skatAppModel);
            this.template.appendTo(this.getContainer());
            this.init();
        }

        private template:JQuery = this.buildTemplate("player_new");

        public init() {
            this.getContainer().find("#newPlayerName").keyup(()=>{
                this.validatePlayerName();
            });

            this.getContainer().find("#addPlayer").click(e=> {
                if(this.validatePlayerName()){
                    this.getModel().players.add(this.getPlayerNameFromForm())
                } else {
                    e.preventDefault();
                }
            });
        }

        private getPlayerNameFromForm():string {
            return this.getContainer().find("#newPlayerName").val().trim();
        }

        private validatePlayerName() {
            let valid = this.getModel().players.indexOf(this.getPlayerNameFromForm())==-1;

            if(valid){
                this.getContainer().find("#newPlayerName").removeClass("invalid");
                this.getContainer().find("#newPlayerName").addClass("validate");
            } else {
                this.getContainer().find("#newPlayerName").removeClass("validate");
                this.getContainer().find("#newPlayerName").addClass("invalid");
            }

            return valid;
        }
    }

}