import Point from '../geometry/point';
import Node from './node';
import Circle from '../geometry/circle';
import Arc from './arc';
import { DEFAULT_SETTINGS } from '../constants';

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
