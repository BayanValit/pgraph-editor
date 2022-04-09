import { default as Point } from '../geometry/point';
import { default as Node } from './node';
import { default as Circle } from '../geometry/circle';
import { default as Arc } from './arc';
import { DEFAULT_SETTINGS } from '../settings';


export default class Position extends Circle implements Node {

    public readonly type = Position;

    public index?: number | undefined;
    public vx?: number | undefined;
    public vy?: number | undefined;
    public fx?: number | null | undefined;
    public fy?: number | null | undefined;

    public marks = 0;
    public source: Array<Arc> = [];
    public target: Array<Arc> = [];

    constructor(
        center: Point = undefined,
        marks = DEFAULT_SETTINGS.positions.initMarks,
        radius = DEFAULT_SETTINGS.sizes.positionRadius
    ) {
        super(center, radius)
        this.marks = marks;
    }
}
