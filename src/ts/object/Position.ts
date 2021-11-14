import { Arc } from './Arc.js';

export class Position {
    public position: { X: number, Y: number };
    public marks: number;
    public bindingFrom: Array<Arc>;
    public bindingTo: Array<Arc>;

    constructor(position: { X: number, Y: number } = { X: 0, Y: 0 }, marks: number) {
        this.position = position;
        this.marks = marks;
        this.bindingFrom = [];
        this.bindingTo = [];
    }
}
