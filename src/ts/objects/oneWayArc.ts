import Point from '../geometry/point';
import Node from './abstract/node';
import Arc from './abstract/arc';

export default class OneWayArc extends Arc {

    public weight: number;

    constructor(
        source: Node,
        target: Node,
        weight: number,
        hasInhibitory: boolean,
        anchors: Array<Point> = []
    ) {
        super(
            source,
            target,
            hasInhibitory,
            anchors
        );

        this.weight = weight;
    }
}
