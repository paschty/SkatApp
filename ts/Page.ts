namespace SkatApp {
    export class Page {
        private arguments:Array<string>;

        constructor(private skatAppModel:SkatApp.SkatAppModel){
            this.container = jQuery("<section />");
            this.container.addClass("page");
        }

        private container:JQuery;

        public getModel():SkatApp.SkatAppModel {
            return this.skatAppModel;
        }

        public getContainer():JQuery {
            return this.container;
        }

        public buildTemplate(id) {
            return jQuery(jQuery("#" + id).detach().html());
        }

        public setArguments(strings:Array<string>) {
            this.arguments = strings;

        }

        public activate(currentArguments:string[]) {

        }

        public deactivate(){

        }
    }

}