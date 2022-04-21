import Point from '../geometry/point';
import Node, { NodeType } from './abstract/node';
import Circle from '../geometry/circle';
import Arc from './abstract/arc';
import { SETTINGS } from '../constants';

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
        center: Point = undefined,
        marks: number = SETTINGS.object.initMarks,
        radius = SETTINGS.object.positionRadius,
    ) {
        super(radius, center)

        this.marks = marks;
    }

    public setCenter(center: Point) {
        this.center = center;
        this.source.forEach((arc) => (arc.end = center));
        this.target.forEach((arc) => (arc.start = center));
    }
}
