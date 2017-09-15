namespace SkatApp {
    export class MainMenu extends Page {

        constructor(skatAppModel:SkatApp.SkatAppModel) {
            super(skatAppModel);
            this.template.appendTo(this.getContainer());
        }

        private template:JQuery = this.buildTemplate("main");

      

    }

}