import { SimulationLinkDatum, SimulationNodeDatum } from 'd3';
import { default as Point } from '../geometry/point';
import { default as ObjectInterface } from './objectInterface';
import { default as Node } from './node';
import { default as Path } from '../geometry/path';
import { default as Line } from '../geometry/line';

export default class Arc extends Path implements SimulationLinkDatum<SimulationNodeDatum>, ObjectInterface {

    public index?: number;
    public isInverted = false;

    constructor(
        public serial: string,
        public source: Node,
        public target: Node,
        public hasInhibitory: boolean,
        public multiplicity: number,
        public marginStart: number = 15,
        public marginEnd: number = 15,
        anchors: Array<Point> = []
    ) {
        super(anchors, source.center, target.center);
    }

    public calcMargins(): void {
        const line = new Line(this.source.center, this.target.center)
            .marginsToFigures(this.source, this.target, this.marginStart, this.marginEnd);
        this.start = line.start;
        this.end = line.end;
    }
}
