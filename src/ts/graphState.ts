import Arc from './objects/abstract/arc';
import Position from './objects/position';
import Transition from './objects/transition';
import Matrix from './math/matrix';
import Node from './objects/abstract/node';
import { LayoutSettings } from './settings';
import { ConfigType, SETTINGS } from './constants';
import TwoFrontAlgorithm from './layout/algorithms/twoFrontAlgorithm';
import OneWayArc from './objects/oneWayArc';
import TwoWayArc from './objects/twoWayArc';
import Point from './geometry/point';

type PositionData   = { center: { x: number, y: number } };
type TransitionData = { center: { x: number, y: number }, rotate: number };
type ArcData        = { binding: string, anchors: Array<{ x: number, y: number }> };

export type GraphStateData = {
    type: ConfigType;
    markup: number[];
    matrices: {
        FP: number[][];
        FT: number[][];
        FI?: number[][];
    },
    positions  : Array<PositionData>;
    transitions: Array<TransitionData>;
    arcs       : Array<ArcData>;
}

export type CollectionData = { 
    positions: Array<Position>,
    transitions: Array<Transition>,
    arcs: Array<Arc>
};

export enum GraphStateEventType {
    Changed = 'changed',
    Zoomed  = 'zoomed',
    MarkupChanged  = 'markup-changed',
}

export default class GraphState extends EventTarget {

    public collection: CollectionData;

    constructor(
        collection: CollectionData,
        public type: ConfigType,
        public settings: LayoutSettings = SETTINGS.layout
    ) {
        super();

        // @TODO: this should be implemented as strategy pattern 
        // @see https://refactoring.guru/ru/design-patterns/strategy (works only with VPN)
        this.collection = (new TwoFrontAlgorithm(collection, this.settings)).computeLayout();
    }

    public emit(type: GraphStateEventType, eventData: CustomEventInit = undefined) {
        this.dispatchEvent(new CustomEvent(type, eventData));
    }

    public static create(data: GraphStateData, settings: LayoutSettings = SETTINGS.layout) {

        const collection: CollectionData = {
            arcs: [],
            positions: [],
            transitions: []
        }

        const { FP, FT, FI } = { ...data.matrices };

        FP.forEach((_, i: number) => collection.positions.push(new Position(i + 1, data.positions[i]?.center, data.markup[i])));
        FT.forEach((_, i: number) => collection.transitions.push(
            new Transition(i + 1, data.transitions[i]?.center, data.transitions[i]?.rotate))
        );

        const getArcsFromMatrix = (nodeFrom: Node[], nodeTo: Node[]) => {
            const canBeInhibitory = nodeFrom[0] instanceof Position && data.type == ConfigType.Inhibitor;
            const matrix = (collection: Node[]) => (collection[0] instanceof Position ? FP : FT);

            matrix(nodeFrom).forEach((array, row: number) => {
                array.forEach((cell, col: number) => {
                    const hasInhibitory = canBeInhibitory && Boolean(FI[row][col]);
                    if (cell || hasInhibitory) { // cell is matrix(nodeFrom)[row][col]
                        let arc: Arc;

                        if (matrix(nodeTo)[col] && matrix(nodeTo)[col][row]) {
                            arc = new TwoWayArc(
                                nodeFrom[row],
                                nodeTo[col],
                                matrix(nodeTo)[col][row],
                                cell,
                                hasInhibitory,
                            );
                            matrix(nodeTo)[col][row] = 0;
                        } else {
                            arc = new OneWayArc(
                                nodeFrom[row],
                                nodeTo[col],
                                cell,
                                hasInhibitory,
                            );
                        }
                        const anchors = data.arcs?.find((x) => x.binding == arc.getSerial())?.anchors;

                        arc.anchors = anchors ? anchors.map((anchor) => (new Point(anchor.x, anchor.y))) : [];
    
                        nodeFrom[row].target.push(arc);
                        nodeTo[col].source.push(arc);
                        collection.arcs.push(arc);
                    }
                });
            });
        }

        getArcsFromMatrix(collection.positions, collection.transitions);
        getArcsFromMatrix(collection.transitions, collection.positions);

        return new GraphState(collection, data.type, settings);
    }

    public updateMarkup(markup: number[]): void {
        this.collection.positions.forEach((position: Position, index) => {
            position.marks = markup[index] ?? 0;
        });
        this.emit(GraphStateEventType.MarkupChanged);
    }

    public getData(): GraphStateData {

        const { positions, transitions, arcs } = { ...this.collection };

        const FP = Matrix.createMatrix(positions.length, transitions.length);
        const FT = Matrix.createMatrix(transitions.length, positions.length);
        const FI = Matrix.createMatrix(positions.length, transitions.length);

        const markup: number[] = [];

        const data: GraphStateData = {
            matrices: undefined,
            markup,
            type: this.type,
            positions: [],
            transitions: [],
            arcs: []
        };
        positions.forEach((position, row) => {
            position.target.forEach(arc => {

                const col = transitions.indexOf(arc.target as Transition);

                if (col >= 0 && arc instanceof OneWayArc) {
                    FP[row][col] = arc.weight;
                    FI[row][col] = Number(arc.hasInhibitory);
                }
                if (col >= 0 && arc instanceof TwoWayArc) {

                    FP[row][col] = arc.targetWeight;
                    FT[col][row] = arc.sourceWeight;
                    FI[row][col] = Number(arc.hasInhibitory);
                }
            });
            data.markup.push(position.marks);
            data.positions.push({ center: position.center });
        });

        transitions.forEach((transition, row) => {
            transition.target.forEach(arc => {
                const col = positions.indexOf(arc.target as Position);
                if (col >= 0) {
                    FT[row][col] += (arc as OneWayArc).weight;
                }
            });
            data.transitions.push({ center: transition.center, rotate: transition.rotateAngle });
        });

        arcs.forEach((arc: Arc) => data.arcs.push({ binding: arc.getSerial(), anchors: arc.anchors }));

        data.matrices = { FP, FT, FI: this.type == ConfigType.Inhibitor ? FI : null };

        return data;
    }
}
