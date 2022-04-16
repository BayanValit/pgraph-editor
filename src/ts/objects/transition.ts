import Point from '../geometry/point';
import Node, { NodeType } from './abstract/node';
import Arc from './abstract/arc';
import Rectangle from '../geometry/rectangle';
import { DEFAULT_SETTINGS } from '../constants';

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
        center: Point = new Point(0, 0),
        rotateAngle = 0,
    ) {
        const width = DEFAULT_SETTINGS.object.transitionWidth;
        const height = DEFAULT_SETTINGS.object.transitionHeight;

        super(width, height, center, rotateAngle)
    }
}
