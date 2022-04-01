import { SimulationLinkDatum, SimulationNodeDatum } from 'd3';
import { Point } from '../geometry/point';
import { ObjectInterface } from './object';
import { Node } from './node';
import { Path } from '../geometry/path';
import { Line } from '../geometry/line';

export class Arc extends Path implements SimulationLinkDatum<SimulationNodeDatum>, ObjectInterface {

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
