import { Arc } from './arc.js';

export class Position implements d3.SimulationNodeDatum {
    index?: number | undefined;
    vx?: number | undefined;
    vy?: number | undefined;
    fx?: number | null | undefined;
    fy?: number | null | undefined;
    x?: number | undefined;
    y?: number | undefined;

    public source: Array<Arc>;
    public target: Array<Arc>;
    public marks = 0;

    constructor(
        position: { X: number, Y: number } = undefined,
        marks: number
    ) {
        this.position = position;
        this.marks = marks;
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
