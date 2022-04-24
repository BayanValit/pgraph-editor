import Point from '../geometry/point';
import Node from './abstract/node';
import Arc from './abstract/arc';
import { SETTINGS } from '../constants';

export default class TwoWayArc extends Arc {

    public readonly linkSymbol = SETTINGS.object.twoWayArcSymbol;
    public readonly hideAtLength = SETTINGS.object.twoWayArcHideAtLength;
    public readonly labelPattern = SETTINGS.object.twoWayArcLabelPattern;

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
