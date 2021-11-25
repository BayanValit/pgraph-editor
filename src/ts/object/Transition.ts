import { Arc } from './arc.js';

export class Transition {
    public bindingFrom: Array<Arc>;
    public bindingTo: Array<Arc>;

    constructor(
        public position: { X: number, Y: number } = undefined,
        public rotate = 0
    ) {
        this.bindingFrom = [];
        this.bindingTo = [];
    }
}
