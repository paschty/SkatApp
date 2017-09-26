
namespace SkatApp {
    export class OptionMenu extends Page {

        constructor(skatAppModel:SkatApp.SkatAppModel) {
            super(skatAppModel);
            this.template.appendTo(this.getContainer());
            this.initEvents();
        }

        private template:JQuery = this.buildTemplate("options");

        public initEvents(){
            this.getContainer().find("#test").click(()=>{
                let testDB = this.getDBFromForm();
                this.testDatabase(testDB);
            });
            
            this.getContainer().find("#save").click(()=>{
                this.getModel().setDatabase(this.getDBFromForm());
                this.getModel().updateFromServer();
            });

            this.getContainer().find("#reset").click(()=>{
                let reset = window.confirm("Reset?");
                if(reset){
                    this.getModel().reset();
                }
            });

            this.getContainer().find("#skatDB").val(this.getModel().getDatabase());
        }

        private getDBFromForm() {
            return this.getContainer().find("#skatDB").val();
        }

        private testDatabase(testDB:any) {
            jQuery.ajax({
                url : testDB + "/JSON/players", success : (result)=> {
                    alert("Test erfolgreich!");
                },
                error : ()=> {
                    alert("Test fehlgeschlagen!");
                }
            });
        }

    }

}
