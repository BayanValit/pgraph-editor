import { ObjectInterface } from './object.js';
import { Point } from '../geometry/point.js';
import { Arc } from './arc.js';
import { Position } from './position.js';
import { Transition } from './transition.js';
import { Figure } from '../geometry/figure.js';

export interface Node extends d3.SimulationNodeDatum, ObjectInterface, Figure {
    index?: number | undefined;
    vx?: number | undefined;
    vy?: number | undefined;
    fx?: number | null | undefined;
    fy?: number | null | undefined;
    x?: number | undefined;
    y?: number | undefined;

    center: Point;
    source: Array<Arc>;
    target: Array<Arc>;
    type: typeof Position | typeof Transition;
}
