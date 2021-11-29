import { Node } from './node.js';
import { default as Constants } from '../constants.js';

export class Position extends Node {

    public marks = 0;
    public radius: number;

    constructor(
        position: { X: number, Y: number } = undefined,
        marks: number
    ) {
        super(position, Position);
        this.marks = marks;
        this.radius = Constants.defaultSizes.positionRadius;
    }
}
