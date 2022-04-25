import { LayoutSettings } from "../../settings";
import { CollectionData } from "../../graphState";
import Node from "../../objects/abstract/node";
import Point from "../../geometry/point";
import Layout from "../layout";
import LayoutAlgorithm from "./layoutAlgorithm";
import Position from "../../objects/position";
import Transition from "../../objects/transition";

type IntervalOffset = { 
    offset: number,
    interval: number,
};

export default class TwoFrontAlgorithm extends LayoutAlgorithm implements Layout {

    public readonly canExpand = false;

    constructor(
        collection: CollectionData,
        settings: LayoutSettings,
    ) {
        super(collection, settings);
    }

    public applyLayout(): void {

        const transitionsCount = this.collection.transitions.length,
              positionsCount   = this.collection.positions.length,
              positionsTopCount    = Math.ceil(positionsCount / 2),
              positionsBottomCount = Math.floor(positionsCount / 2);

        const layoutBasisType = positionsTopCount > transitionsCount ? Position : Transition,
              layoutColumns   = Math.max(transitionsCount, positionsTopCount);

        const deltaX = this.settings.baseIntervalX;
        const deltaY = layoutColumns > 6 ? this.scaleIntervalY(layoutColumns) * this.settings.baseIntervalY : this.settings.baseIntervalY;

        const [transitions, positionsTop, positionsBottom] = [
            this.collection.transitions,
            this.collection.positions.slice(0, positionsTopCount),
            this.collection.positions.slice(positionsTopCount)
        ];

        let transitionIntervalX: IntervalOffset,
            positionTopIntervalX: IntervalOffset,
            positionBottomIntervalX: IntervalOffset;

        if (layoutBasisType == Transition) {
            transitionIntervalX = { offset: 0, interval: deltaX };
            positionTopIntervalX = this.getIntervalOffset(deltaX, positionsTopCount, transitionsCount);
            positionBottomIntervalX = this.getIntervalOffset(deltaX, positionsBottomCount, transitionsCount);
        } else {
            positionTopIntervalX = { offset: 0, interval: deltaX };
            positionBottomIntervalX = this.getIntervalOffset(deltaX, positionsBottomCount, positionsTopCount);
            transitionIntervalX = this.getIntervalOffset(deltaX, transitionsCount, positionsTopCount);
        }
        this.setCenters(positionsTop, positionTopIntervalX, deltaX, 0);
        this.setCenters(positionsBottom, positionBottomIntervalX, deltaX, deltaY * 2);
        this.setCenters(transitions, transitionIntervalX, deltaX, deltaY);
    }

    protected scaleIntervalY(y: number) {
        return ((y - 1) ** 2) / 400 + 1;
    }

    protected getIntervalOffset(delta: number, minorCount: number, majorCount: number): IntervalOffset {
        if (minorCount <= 1) {
            return { offset: 0, interval: (majorCount - 1) / 2 * delta };
        }
        const offset = Math.floor((majorCount - 1) / (minorCount + 1));
        const interval = (majorCount - offset * 2 - 1) / (minorCount - 1) * delta;
        return { offset, interval };
    }

    protected setCenters(collection: Node[], offsetX: IntervalOffset, deltaX: number, deltaY: number) {

        const basisPoint = new Point(0, 0);

        collection.forEach((node, index) => {
            node.setCenter(
                new Point(offsetX.offset * deltaX + offsetX.interval * (collection.length > 1 ? index : 1), deltaY).add(basisPoint)
            );
        });
    }
}
