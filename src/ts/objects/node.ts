import { SimulationNodeDatum } from 'd3-force';
import { default as ObjectInterface } from './objectInterface';
import { default as Point } from '../geometry/point';
import { default as Arc } from './arc';
import { default as Position } from './position';
import { default as Transition } from './transition';
import { default as Figure } from '../geometry/figure';

export default interface Node extends SimulationNodeDatum, ObjectInterface, Figure {
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
