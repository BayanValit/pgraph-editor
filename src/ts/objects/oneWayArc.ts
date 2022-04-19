import Point from '../geometry/point';
import Node from './abstract/node';
import Arc from './abstract/arc';
import { DEFAULT_SETTINGS } from '../constants';
import { formatArcLabelText } from '../utils/formatText';

export default class OneWayArc extends Arc {

    public weight: number;
    public readonly linkSymbol = DEFAULT_SETTINGS.object.oneWayArcSymbol;
    public readonly labelPattern = DEFAULT_SETTINGS.object.oneArcLabelPattern;
    public readonly hideAtLength = DEFAULT_SETTINGS.object.oneArcHideAtLength;

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

    public getLabel(): string {
        if (this.weight > 1) {
            return formatArcLabelText(this);
        }
    }
}
