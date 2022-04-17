import Arc from './objects/abstract/arc';
import Position from './objects/position';
import Transition from './objects/transition';
import Matrix from './math/matrix';
import Node from './objects/abstract/node';
import { LayoutSettings } from './settings';
import { ConfigType, DEFAULT_SETTINGS } from './constants';
import { GraphStateData } from './utils/jsonGraphState';
import TwoFrontAlgorithm from './layout/algorithms/twoFrontAlgorithm';
import OneWayArc from './objects/oneWayArc';
import TwoWayArc from './objects/twoWayArc';

export type CollectionData = { 
    positions: Array<Position>,
    transitions: Array<Transition>,
    arcs: Array<Arc>
};

export enum GraphStateEventType {
    Changed = 'changed'
}

export default class GraphState extends EventTarget {

    public collection: CollectionData;

    constructor(
        collection: CollectionData,
        public name: string,
        public type: ConfigType,
        public settings: LayoutSettings = DEFAULT_SETTINGS.layout
    ) {
        super();

        // @TODO: this should be implemented as strategy pattern 
        // @see https://refactoring.guru/ru/design-patterns/strategy (works only with VPN)
        this.collection = (new TwoFrontAlgorithm(collection, this.settings)).setLayout();
    }

    public emit(type: GraphStateEventType) {
        this.dispatchEvent(new CustomEvent(type));
    }

    public static create(data: GraphStateData, settings: LayoutSettings = DEFAULT_SETTINGS.layout) {

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
            const canBeInhibitory = nodeFrom[0] instanceof Position && data.type == ConfigType.Inhibitory;
            const matrix = (collection: Node[]) => (collection[0] instanceof Position ? FP : FT);

            matrix(nodeFrom).forEach((array, row: number) => {
                array.forEach((cell, col: number) => {
                    if (cell) { // cell is matrix(nodeFrom)[row][col]
                        let arc: Arc;

                        if (matrix(nodeTo)[row][col]) {
                            arc = new TwoWayArc(
                                nodeFrom[row],
                                nodeTo[col],
                                cell,
                                matrix(nodeTo)[row][col]
                            );
                            matrix(nodeTo)[row][col] = 0;
                        } else {
                            arc = new OneWayArc(
                                nodeFrom[row],
                                nodeTo[col],
                                cell,
                                canBeInhibitory && Boolean(FI[row][col])
                            );
                        }
                        arc.anchors = data.arcs?.find((x) => x.binding == arc.getSerial())?.anchors;
    
                        nodeFrom[row].target.push(arc);
                        nodeTo[col].source.push(arc);
                        collection.arcs.push(arc);
                    }
                });
            });
        }

        getArcsFromMatrix(collection.positions, collection.transitions);
        getArcsFromMatrix(collection.transitions, collection.positions);

        return new GraphState(collection, data.name, data.type, settings);
    }

    public getData(): GraphStateData {

        const { positions, transitions, arcs } = { ...this.collection };

        const FP = Matrix.createMatrix(positions.length, transitions.length);
        const FT = Matrix.createMatrix(transitions.length, positions.length);
        const FI = Matrix.createMatrix(positions.length, transitions.length);

        const markup: number[] = [];

        const data: GraphStateData = {
            name: this.name,
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
                    FP[row][col] = arc.sourceWeight;
                    FT[row][col] = arc.targetWeight;
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

        data.matrices = { FP, FT, FI: this.type == ConfigType.Inhibitory ? FI : null };

        return data;
    }
}
