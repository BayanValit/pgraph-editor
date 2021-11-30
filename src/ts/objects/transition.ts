import { Point } from './point.js';
import { Node } from './node.js';
import { default as Settings } from '../settings.js';

export class Transition extends Node {

    public rotate = 0;
    public height: number;
    public width: number;

    constructor(
        position: Point = undefined,
        rotate: number
    ) {
        super(position, Transition);
        this.rotate = rotate;
        this.height = Settings.defaultSizes.transitionHeight;
        this.width = Settings.defaultSizes.transitionWidth;
    }
}
