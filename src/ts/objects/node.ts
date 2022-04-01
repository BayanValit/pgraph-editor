import { ObjectInterface } from './object';
import { Point } from '../geometry/point';
import { Arc } from './arc';
import { Position } from './position';
import { Transition } from './transition';
import { Figure } from '../geometry/figure';

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
