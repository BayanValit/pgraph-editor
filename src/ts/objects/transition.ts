import { Node } from './node.js';
import { default as Constants } from '../constants.js';

export class Transition extends Node {

    public rotate = 0;
    public height: number;
    public width: number;

    constructor(
        position: { X: number, Y: number } = undefined,
        rotate: number
    ) {
        super(position, Transition);
        this.rotate = rotate;
        this.height = Constants.defaultSizes.transitionHeight;
        this.width = Constants.defaultSizes.transitionWidth;
    }
}
