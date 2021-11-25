import { Arc } from './arc.js';

export class Position {
    public bindingFrom: Array<Arc>;
    public bindingTo: Array<Arc>;

    constructor(
        public position: { X: number, Y: number } = undefined,
        public marks = 0
    ) {
        this.bindingFrom = [];
        this.bindingTo = [];
    }
}
