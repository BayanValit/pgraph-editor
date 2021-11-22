import { Arc } from './arc.js';

export class Transition {
    public bindingFrom: Array<Arc>;
    public bindingTo: Array<Arc>;

    constructor(
        public position: { X: number, Y: number } = { X: 0, Y: 0 },
        public rotate = 0
    ) {
        this.bindingFrom = [];
        this.bindingTo = [];
    }
}
