import { Point } from '../geometry/point.js';
import { ObjectInterface } from './object.js';
import Settings from '../settings.js';
import { Node } from './node.js';
import { Path } from '../geometry/path.js';
import { Line } from '../geometry/line.js';

export class Arc extends Path implements d3.SimulationLinkDatum<d3.SimulationNodeDatum>, ObjectInterface {

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
