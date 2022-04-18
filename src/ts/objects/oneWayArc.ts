import Point from '../geometry/point';
import Node from './abstract/node';
import Arc from './abstract/arc';
import { DEFAULT_SETTINGS } from '../constants';

export default class OneWayArc extends Arc {

    public weight: number;
    public readonly linkSymbol = DEFAULT_SETTINGS.object.oneWayArcSymbol;
    public readonly hideAtLength = 0; // TODO: move to setting

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
        return (this.weight > 1 && !this.hasInhibitory) ? `– ${this.weight} –` : '';
    }
}
