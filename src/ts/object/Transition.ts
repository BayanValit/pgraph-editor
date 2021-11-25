import { Arc } from './arc.js';

export class Transition implements d3.SimulationNodeDatum {
    index?: number | undefined;
    vx?: number | undefined;
    vy?: number | undefined;
    fx?: number | null | undefined;
    fy?: number | null | undefined;
    x?: number | undefined;
    y?: number | undefined;

    public source: Array<Arc>;
    public target: Array<Arc>;
    public rotate = 0;

    constructor(
        position: { X: number, Y: number } = undefined,
        rotate: number
    ) {
        this.x = position?.X;
        this.y = position?.Y;
        this.rotate = rotate;
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
