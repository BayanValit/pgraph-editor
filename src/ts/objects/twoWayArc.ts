import Point from '../geometry/point';
import Node from './abstract/node';
import Arc from './abstract/arc';
import { DEFAULT_SETTINGS } from '../constants';

export default class TwoWayArc extends Arc {

    public readonly linkSymbol = DEFAULT_SETTINGS.object.twoWayArcSymbol;
    public readonly hideAtLength = 12; // TODO: move to setting

    constructor(
        source: Node,
        target: Node,
        public sourceWeight: number,
        public targetWeight: number,
        hasInhibitory: boolean,
        anchors: Array<Point> = []
    ) {
        super(
            source,
            target,
            hasInhibitory,
            anchors
        );
    }

    public getLabel(): string {
        return `– ${this.targetWeight} | ${this.hasInhibitory ? '⦿' : this.sourceWeight + ' –'}`;
    }
}
