import { ObjectInterface } from './object.js';
import { Arc } from './arc.js';
import { Position } from './position.js';
import { Transition } from './transition.js';

export class Node implements d3.SimulationNodeDatum, ObjectInterface {
    index?: number | undefined;
    vx?: number | undefined;
    vy?: number | undefined;
    fx?: number | null | undefined;
    fy?: number | null | undefined;
    x?: number | undefined;
    y?: number | undefined;

    public source: Array<Arc>;
    public target: Array<Arc>;
    public type: typeof Position | typeof Transition;

    constructor(
        position: { X: number, Y: number } = undefined,
        type: typeof Position | typeof Transition = undefined
    ) {
        this.position = position;
        this.type = type;
        this.source = [];
        this.target = [];
    }

    public set position(point : { X: number, Y: number }) {
        this.x = point.X;
        this.y = point.Y;
    }

    public get position(): { X: number, Y: number } {
        return { X: this.x, Y: this.y };
    }
}
