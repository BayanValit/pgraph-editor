import Point from '../geometry/point';
import Circle from '../geometry/circle';
import Arc from './oneWayArc';
import { SETTINGS } from '../constants';
import { SimulationNodeDatum } from 'd3-force';

export default class Anchor extends Circle implements SimulationNodeDatum {

    public index?: number | undefined;
    public vx?: number | undefined;
    public vy?: number | undefined;
    public fx?: number | null | undefined;
    public fy?: number | null | undefined;
    public x?: number | undefined;
    public y?: number | undefined;

    constructor(
        public parent: Arc,
        center?: Point,
        radius = SETTINGS.object.anchorRadius,
    ) {
        super(radius, center)
    }
}
