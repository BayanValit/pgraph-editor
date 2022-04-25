import Point from '../geometry/point';
import Node, { NodeType } from './abstract/node';
import Arc from './abstract/arc';
import Rectangle from '../geometry/rectangle';
import { SETTINGS } from '../constants';

export default class Transition extends Rectangle implements Node {

    public readonly nodeType = NodeType.Transition;

    public index?: number | undefined;
    public vx?: number | undefined;
    public vy?: number | undefined;
    public fx?: number | null | undefined;
    public fy?: number | null | undefined;
    public x?: number | undefined;
    public y?: number | undefined;

    public source: Array<Arc> = [];
    public target: Array<Arc> = [];

    constructor(
        public displayIndex: number,
        center: Point | { x: number, y: number } = undefined,
        rotateAngle = 0,
    ) {
        super(SETTINGS.object.transitionWidth, SETTINGS.object.transitionHeight, center, rotateAngle);
    }

    public setCenter(center: Point) {
        this.center = center;
        this.source.forEach((arc) => (arc.end = center));
        this.target.forEach((arc) => (arc.start = center));
    }
}
