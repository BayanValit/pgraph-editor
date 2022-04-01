import { SimulationLinkDatum, SimulationNodeDatum } from 'd3';
import { Point } from '../geometry/point';
import { ObjectInterface } from './object';
import Settings from '../settings';
import { Node } from './node';
import { Path } from '../geometry/path';
import { Line } from '../geometry/line';

export class Arc extends Path implements SimulationLinkDatum<SimulationNodeDatum>, ObjectInterface {

    public index?: number | undefined;
    public isInverted = false;

    constructor(
        public serial: string,
        public source: Node,
        public target: Node,
        public has_inhibitory: boolean,
        public multiplicity: number,
        anchors: Array<Point> = []
    ) {
        super(anchors, source.center, target.center);
    }

    public calcMargins(): void {

        const [marginStart, marginEnd] = [Settings.defaultPositions.arcMarginStart, Settings.defaultPositions.arcMarginEnd];
        const line = new Line(this.source.center, this.target.center).marginsToFigures(this.source, this.target, marginStart, marginEnd);

        this.start = line.start;
        this.end = line.end;
    }
}
