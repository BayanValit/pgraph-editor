import { Arc } from './Arc.js';

export class Transition {
    public position: { X: number, Y: number };
    public size: { width: number, height: number };
    public bindingFrom: Array<Arc>;
    public bindingTo: Array<Arc>;

    constructor(
        position: { X: number, Y: number } = { X: 0, Y: 0 },
        size: { width: number, height: number } = { width: 40, height: 120 }
    ) {
        this.position = position;
        this.size = size;
        this.bindingFrom = [];
        this.bindingTo = [];
    }
}
