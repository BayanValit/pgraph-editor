import Point from '../geometry/point';
import Node from './abstract/node';
import Arc from './abstract/arc';

export default class TwoWayArc extends Arc {

    public readonly linkSymbol = '⮂';
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
}
