import { Point } from '../geometry/point.js';
import { Node } from './node.js';
import { Arc } from './arc.js';
import { Rectangle } from '../geometry/rectangle.js';
import { default as Settings } from '../settings.js';

export class Transition extends Rectangle implements Node {

    public readonly type = Transition;

    public index?: number | undefined;
    public vx?: number | undefined;
    public vy?: number | undefined;
    public fx?: number | null | undefined;
    public fy?: number | null | undefined;

    public source: Array<Arc> = [];
    public target: Array<Arc> = [];

    constructor(
        center: Point = undefined,
        rotateAngle = 0
    ) {
        super(Settings.defaultSizes.transitionWidth, Settings.defaultSizes.transitionHeight, center, rotateAngle)
    }
}
