import { SimulationLinkDatum, SimulationNodeDatum } from 'd3';
import Point from '../../geometry/point';
import ObjectInterface from './objectInterface';
import Node from './node';
import Path from '../../geometry/path';
import Line from '../../geometry/line';
import { DEFAULT_SETTINGS } from '../../constants';

export default abstract class Arc extends Path implements SimulationLinkDatum<SimulationNodeDatum>, ObjectInterface {

    public marginStart = DEFAULT_SETTINGS.object.arcMarginStart;
    public marginEnd = DEFAULT_SETTINGS.object.arcMarginEnd;
    public hidden = false;
    public isReversed = false;

    constructor(
        public source: Node,
        public target: Node,
        public hasInhibitory: boolean = false,
        anchors: Array<Point> = []
    ) {
        super(anchors, source.center, target.center);
    }

    public calcMargins(): void {
        const line = new Line(this.source.center, this.target.center).marginsToFigures(
            this.source, this.target, this.marginStart, this.marginEnd
        );
        this.start = line.start;
        this.end = line.end;
        this.isReversed = line.isReversed;
        this.hideSmall();
    }

    public getSerial(): string {
        return this.source.nodeType + this.source.displayIndex  + '-' + this.target.nodeType + this.target.displayIndex;
    }

    protected hideSmall(): void {
        this.hidden = this.isReversed && this.getVector().getVectorLength() > 5; 
    }
}
