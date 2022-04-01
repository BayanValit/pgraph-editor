import { Point } from '../geometry/point';
import { Node } from './node';
import { Arc } from './arc';
import { Rectangle } from '../geometry/rectangle';
import { default as Settings } from '../settings';

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
