import { ObjectInterface } from './object.js';
import { Point } from './point.js';
import { Arc } from './arc.js';
import { Position } from './position.js';
import { Transition } from './transition.js';

export class Node implements d3.SimulationNodeDatum, ObjectInterface {
    public index?: number | undefined;
    public vx?: number | undefined;
    public vy?: number | undefined;
    public fx?: number | null | undefined;
    public fy?: number | null | undefined;
    public x?: number | undefined;
    public y?: number | undefined;

    public source: Array<Arc>;
    public target: Array<Arc>;
    public type: typeof Position | typeof Transition;

    constructor(
        position: Point = undefined,
        type: typeof Position | typeof Transition = undefined
    ) {
        this.position = position;
        this.type = type;
        this.source = [];
        this.target = [];
    }

    public set position(point: Point) {
        this.x = point?.x;
        this.y = point?.y;
    }

    public get position(): Point {
        return this.x && this.y ? new Point({ x: this.x, y: this.y }) : undefined;
    }
}
