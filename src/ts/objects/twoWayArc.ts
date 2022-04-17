import Point from '../geometry/point';
import Node from './abstract/node';
import Arc from './abstract/arc';

export default class TwoWayArc extends Arc {

    public readonly hasInhibitory = false;

    constructor(
        source: Node,
        target: Node,
        public sourceWeight: number,
        public targetWeight: number,
        anchors: Array<Point> = []
    ) {
        super(
            source,
            target,
            false,
            anchors
        );
    }

    protected hideSmall(): void {
        this.hidden = this.isReversed || this.getVector().getVectorLength() < 10; 
    }
}
