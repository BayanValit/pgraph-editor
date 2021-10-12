import { d3 } from '../js/lib/d3.v3.min.js';

export class graphBase {
    required: boolean;
    optional?: boolean;
    style?: any;
    constructor(required, optional?, style?) {
        this.required = required;
        this.optional = optional;
        this.style = style;

        this.validate();
        new graphObject('V', 1, []);
    }

    getRequired() {
        console.log(this.required);
        return this.required;
    }

    validate() {
        let rowsFP = this.required['FP'].length;
        let rowsFT = this.required['FT'].length;

        this.required['FP'].forEach(element => {
            if (element.length != rowsFT) {
                throw new Error("Неверный формат входных данных");
            }
        });
        this.required['FT'].forEach(element => {
            if (element.length != rowsFP) {
                throw new Error("Неверный формат входных данных");
            }
        });
    }
}

const myEvent = new Event('onGraphChange', {
    bubbles: true,
    cancelable: true,
    composed: false
});

const enumerable = variables => variables;

const types = enumerable([
    "V",
    "T"
]);

class graphObject {
    type: [string, unknown];
    serial: any;
    bindings: any;
    /**
     * @param {string} type
     * @param {number} serial
     * @param {graphObject[]} bindings
     */
    constructor(type: string, serial: number, bindings: graphObject[]) {
        this.type = Object.entries(types)[type];
        this.serial = serial;
        this.bindings = bindings;

        for (let [key, val] of Object.entries(types)) {
              document.writeln(`${val.toString()}`)
        }
        console.log();

    } 
}
