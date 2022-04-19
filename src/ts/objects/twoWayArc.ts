import Point from '../geometry/point';
import Node from './abstract/node';
import Arc from './abstract/arc';
import { DEFAULT_SETTINGS } from '../constants';

export default class TwoWayArc extends Arc {

    public readonly linkSymbol = DEFAULT_SETTINGS.object.twoWayArcSymbol;
    public readonly labelPattern = DEFAULT_SETTINGS.object.twoArcLabelPattern;
    public readonly hideAtLength = DEFAULT_SETTINGS.object.twoArcHideAtLength;

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
