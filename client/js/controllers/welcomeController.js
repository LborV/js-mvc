import {Controller} from '/kernel/Controller.js';

export default class welcomeController extends Controller{
    constructor(settings) {
        super(settings);

        this.arr = [
            1, 2, 3, 4
        ];

        this.isBool = true;

        this.colorIsRed = true;
        
        console.log(this.app.slugData)
        console.log(this.app.searchParams)
    }

    newData(data) {
        this.arr = data;
        return this.reload();
    }

    toggleIsBool() {
        this.isBool = !this.isBool;
        this.reload();
    }

    onShow() {
        console.log(`${this.id} controller showed`);
    }

    onLoad() {
        console.log('Started:'+this.name);

        if(!app.getController('welcomeController')) {
            this.show();
        }
    }
};