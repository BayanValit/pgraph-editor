import Point from '../geometry/point';
import Node from './node';
import Arc from './arc';
import Rectangle from '../geometry/rectangle';
import { DEFAULT_SETTINGS } from '../constants';

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
