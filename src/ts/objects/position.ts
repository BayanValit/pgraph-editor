import { Point } from '../geometry/point.js';
import { Node } from './node.js';
import { default as Settings } from '../settings.js';
import { Circle } from '../geometry/circle.js';
import { Arc } from './arc.js';

export class Position extends Circle implements Node {

    public readonly type = Position;

    public index?: number | undefined;
    public vx?: number | undefined;
    public vy?: number | undefined;
    public fx?: number | null | undefined;
    public fy?: number | null | undefined;

    public marks = 0;
    public radius: number;
    public source: Array<Arc> = [];
    public target: Array<Arc> = [];

    constructor(
        center: Point = undefined,
        marks: number
    ) {
        super(center, Settings.defaultSizes.positionRadius)
        this.marks = marks;
    }
}
