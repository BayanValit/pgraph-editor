import Point from '../geometry/point';
import Node from './abstract/node';
import Arc from './abstract/arc';
import { SETTINGS } from '../constants';

export default class OneWayArc extends Arc {

    public weight: number;
    public readonly linkSymbol = SETTINGS.object.oneWayArcSymbol;
    public readonly hideAtLength = SETTINGS.object.oneWayArcHideAtLength;
    public readonly labelPattern = SETTINGS.object.oneWayArcLabelPattern;

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
