import { Point } from './point.js';
import { Node } from './node.js';
import { default as Settings } from '../settings.js';

export class Position extends Node {

    public marks = 0;
    public radius: number;

    constructor(
        position: Point = undefined,
        marks: number
    ) {
        super(position, Position);
        this.marks = marks;
        this.radius = Settings.defaultSizes.positionRadius;
    }
}
