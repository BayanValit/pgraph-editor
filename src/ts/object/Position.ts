import { Arc } from './arc.js';

export class Position {
    public bindingFrom: Array<Arc>;
    public bindingTo: Array<Arc>;

    constructor(
        public position: { X: number, Y: number } = { X: 0, Y: 0 },
        public marks = 0
    ) {
        this.bindingFrom = [];
        this.bindingTo = [];
    }
}
