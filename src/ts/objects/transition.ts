import { default as Point } from '../geometry/point';
import { default as Node } from './node';
import { default as Arc } from './arc';
import { default as Rectangle } from '../geometry/rectangle';
import { DEFAULT_SETTINGS } from '../settings';

export default class Transition extends Rectangle implements Node {

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
        rotateAngle = 0,
        width = DEFAULT_SETTINGS.sizes.transitionWidth,
        height = DEFAULT_SETTINGS.sizes.transitionHeight
    ) {
        super(width, height, center, rotateAngle)
    }
}
