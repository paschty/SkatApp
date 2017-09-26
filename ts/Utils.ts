namespace SkatApp {

    export interface SALististener<T> {
        itemAdded(index:number, item:T);
        itemRemoved(lastIndex:number, item:T);
        itemMoved(from:number, to:number);
    }

    export class SAArrayList<T> {
        constructor() {
        }

        private base = new Array<T>();
        public listeners = new Array<SALististener<T>>();

        public add(item:T, index = this.base.length) {
            this.base.splice(index, 0, item)
            this.listeners.forEach((listener)=> {
                listener.itemAdded(index, item);
            });
        }

        public removeFirst(item:T):T {
            let position = this.base.indexOf(item);
            if (position != -1) {
               return this.remove(position);
            }
        }

        public remove(index:number){
            let removed = this.base.splice(index, 1)[ 0 ];
            this.listeners.forEach((listener)=> {
                listener.itemRemoved(index, removed);
            });
            return removed;
        }

        public size(){
            return this.base.length;
        }

        public forEach(fn:(element:T, index:number, size:SAArrayList<T>)=>void) {
            this.base.forEach((e, i)=> {
                fn(e, i, this);
            });
        }

        public forEachReverse(fn:(element:T, index:number, size:SAArrayList<T>)=>void){
            let length = this.base.length-1;
            for(var i = length; i >=0;i--){
                fn(this.base[i], i, this);
            }
        }

        public indexOf(element:T):number {
            return this.base.indexOf(element);
        }

        public toJSON():string {
            return JSON.stringify(this.base);
        }

        public clear():void {
            let oldBase = this.base;
            this.base = new Array();
            oldBase.forEach((element, position)=> {
                this.listeners.forEach((listener)=> {
                    listener.itemRemoved(position, element);
                });
            });
        }

        public get(index:number):T{
            return this.base[index];
        }

        public static fromJSON<T>(json:string):SAArrayList<T> {
            let list = new SAArrayList<T>();

            list.base = JSON.parse(json);

            return list;
        }


    }

}
