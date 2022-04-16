import Point from '../geometry/point';
import Node, { NodeType } from './abstract/node';
import Circle from '../geometry/circle';
import Arc from './abstract/arc';
import { DEFAULT_SETTINGS } from '../constants';

export default class Position extends Circle implements Node {

    public readonly nodeType = NodeType.Position;

    public index?: number | undefined;
    public vx?: number | undefined;
    public vy?: number | undefined;
    public fx?: number | null | undefined;
    public fy?: number | null | undefined;
    public x?: number | undefined;
    public y?: number | undefined;

    public marks = 0;
    public source: Array<Arc> = [];
    public target: Array<Arc> = [];

    constructor(
        public displayIndex: number,
        center: Point = new Point(0, 0),
        marks: number = DEFAULT_SETTINGS.object.initPositionMarks,
    ) {
        super(center, DEFAULT_SETTINGS.object.positionRadius)

        this.marks = marks;
    }
}
