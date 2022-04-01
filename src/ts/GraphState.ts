import { Arc } from './objects/arc';
import { Point } from './geometry/point';
import { Position } from './objects/position';
import { Transition } from './objects/transition';
import { ObjectInterface } from './objects/object';
import { PositionsSettings } from './Settings';
import { Matrix } from './utils/matrix';
import { DEFAULT_SETTINGS } from './constants';

enum ElementType {
    Position = "P" ,
    Transition = "T" ,
    Arc = "A"
}

export enum ConfigType {
    Default = 'default',
    Inhibitory = 'inhibitory'
}


type PositionData = { center: Point };

type TransitionData = { center: Point, rotate: number };

type ArcData = { binding: string; anchors: Point[] };

export interface GraphStateData {
    name: string;
    type: ConfigType;
    markup: number[];
    matrices: {
        FP: Matrix;
        FT: Matrix;
        FI?: Matrix;
    },
    positions?: Array<PositionData>;
    transitions?: Array<TransitionData>;
    arcs?: Array<ArcData>;
}

interface GraphStateConstructorParams {
    name: string;
    type: ConfigType;
    positions: Array<Position>;
    transitions: Array<Transition>;
    arcs: Array<Arc>;
}

export default class GraphState {
    public name: string;
    public type: ConfigType;
    public positions: Array<Position> = [];
    public transitions: Array<Transition> = [];
    public arcs: Array<Arc> = [];

    constructor(args: GraphStateConstructorParams, positions: PositionsSettings = DEFAULT_SETTINGS.positions) {
        this.name = args.name;
        this.type = args.type;
        this.positions = args.positions;
        this.transitions = args.transitions;
        this.arcs = args.arcs;
        this.setCenters(positions);
    }

    public static create(data: GraphStateData, positionsSettings: PositionsSettings = DEFAULT_SETTINGS.positions) {
        const positions: Position[] = [];
        const transitions: Transition[] = [];
        const arcs: Arc[] = [];
        const initialPoint = new Point(0, 0);

        const name = data.name;
        const type = data.type;

        data.matrices.FP.forEach((_, key: number) => {
            const position = data.positions && data.positions[key] || { center: initialPoint };
            positions.push(new Position(position.center, data.markup[key] ?? 0));
        });

        data.matrices.FT.forEach((_, key: number) => {
            const transition = data.transitions && data.transitions[key] || { center: initialPoint, rotate: 0 };
            transitions.push(new Transition(transition.center, transition.rotate ?? 0));
        });

        // FIXME: not DRY
        data.matrices.FP.forEach((array, row: number) => {
            array.forEach((element, col: number) => {
                if (element) {
                    const serial = "P" + (row + 1) + "-T" + (col + 1);
                    const arcData = data.arcs?.find((x) => x.binding == serial);
                    const arc = new Arc(
                        serial,
                        positions[row],
                        transitions[col],
                        type == ConfigType.Inhibitory ? Boolean(data.matrices.FI[row][col]) : false,
                        element,
                        positionsSettings.arcMarginStart,
                        positionsSettings.arcMarginEnd,
                        arcData ? arcData.anchors : []
                    );
                    positions[row].target.push(arc);
                    transitions[col].source.push(arc);
                    arcs.push(arc);
                }
            });
        });
        data.matrices.FT.forEach((array, row: number) => {
            array.forEach((element, col: number) => {
                if (element) {
                    const serial = "T" + (row + 1) + "-P" + (col + 1);
                    const arcData = data.arcs?.find((x) => x.binding == serial);
                    const arc = new Arc(
                        serial,
                        transitions[row],
                        positions[col],
                        false,
                        element,
                        positionsSettings.arcMarginStart,
                        positionsSettings.arcMarginEnd,
                        arcData ? arcData.anchors : []
                    );
                    transitions[row].target.push(arc);
                    positions[col].source.push(arc);
                    arcs.push(arc);
                }
            });
        });
        return new GraphState({
            name,
            type,
            positions,
            transitions,
            arcs
        }, positionsSettings);
    }

    protected setCenters(positions: PositionsSettings) {
        const n = Math.max(this.positions.length, this.transitions.length);
        for (let i = 0; i < n; i += 1) {
            if (this.positions[i] && this.positions[i].center === undefined) {
                this.positions[i].center = this.getOptimalPosition(ElementType.Position, i, positions);
            }
            if (this.transitions[i] && this.transitions[i].center === undefined) {
                this.transitions[i].center = this.getOptimalPosition(ElementType.Transition, i, positions);
            }
        }
    }

    public serialize(): string {
        const matrixCreator = (rows: number, cols: number): Matrix => new Array(rows).fill(undefined).map(() => new Array(cols).fill(0));

        const FP = matrixCreator(this.positions.length, this.transitions.length);
        const FT = matrixCreator(this.transitions.length, this.positions.length);
        const FI = matrixCreator(this.positions.length, this.transitions.length);
        const markup: number[] = [];

        const positions: PositionData[] = [];
        const transitions: TransitionData[] = [];
        const arcs: ArcData[] = [];
        
        this.positions.forEach((position, row) => {
            position.target.forEach(arc => {
                const col = this.transitions.indexOf(arc.target as Transition);
                if (col >= 0) {
                    FP[row][col] = arc.multiplicity;
                    FI[row][col] = Number(arc.hasInhibitory);
                }
            });
            markup.push(position.marks);
            positions.push({ center: position.center });
        });

        this.transitions.forEach((transition, row) => {
            transition.target.forEach(arc => {
                const col = this.positions.indexOf(arc.target as Position);
                if (col >= 0) {
                    FT[row][col] = arc.multiplicity;
                }
            });
            transitions.push({ center: transition.center, rotate: transition.rotateAngle });
        });

        this.arcs.forEach((arc: Arc) => {
            const from = this.getIndexAndType(arc.source);
            const to = this.getIndexAndType(arc.target);
            const binding = from.type + (from.index + 1) + "-" + to.type + (to.index + 1);
            arcs.push({ binding, anchors: arc.anchors });
        });

        const matrices = { FP, FT, FI };

        if (this.type == ConfigType.Default) {
            matrices.FI = null;
        }

        const config: GraphStateData = {
            name: this.name,
            matrices,
            markup,
            type: this.type,
            positions,
            transitions,
            arcs
        }
        
        return JSON.stringify(config, null, 2).replace(/\n(\s+\d,?\n)+\s*/gs, this.formatReplacer);
    }

    public getOptimalPosition(
        graphType: ElementType,
        objectNumber: number,
        positions: PositionsSettings
    ): Point {
        if (graphType == ElementType.Position || graphType == ElementType.Transition) {

            // Indentation for the first position...
            const pX0 = positions.paddingLeft;
            const pY0 = positions.paddingTop;

            // ...and for the first transition
            const tX0 = pX0;
            const tY0 = pY0 + positions.intervalY;

            // Intervals between objects
            let deltaX = positions.intervalX;
            let deltaY = positions.intervalY;
            
            deltaY *= objectNumber % 2 ? 1 : -1; // Symmetrically relative to the transition center

            // Extreme points: The maximum right or top values are among all previous objects
            let extPX = 0, extTX = 0, extPY = 0, extTY = 0;

            if (objectNumber) {
                extPX = Math.max(...this.positions.slice(0, objectNumber).map(p => p.center?.x ?? 0));
                extTX = Math.max(...this.transitions.slice(0, objectNumber).map(t => t.center?.x ?? 0));
                extPY = Math.min(...this.positions.slice(0, objectNumber).map(p => p.center?.y ?? Infinity));
                extTY = Math.min(...this.transitions.slice(0, objectNumber).map(t => t.center?.y ?? Infinity));
            } else {
                deltaX = 0;  // If first
            }
            switch (graphType) {
                case ElementType.Position: {
                    // Critical points: The value of the alternative object of the current index;
                    const critX = this.transitions[objectNumber]?.center?.x ?? 0;
                    const critY = this.transitions[objectNumber]?.center?.y ?? 0;

                    const X = Math.max(extPX + deltaX, pX0 + deltaX, extTX + deltaX, critX);
                    const Y = Math.max(extPY - pY0 + tY0 + deltaY, Math.max(extTY, tY0) + deltaY, objectNumber % 2 ? critY + deltaY : 0, pY0);

                    return new Point(X, Y);
                }
                case ElementType.Transition: {
                    const critX = this.positions[objectNumber]?.center?.x ?? 0;
                    const critY = this.positions[objectNumber]?.center?.y ?? 0;
                    
                    const X = Math.max(extTX + deltaX, tX0 + deltaX, extPX + deltaX, critX); 
                    const Y = Math.max(extTY - tY0 + pY0 + Math.abs(deltaY), objectNumber % 2 ? 0 : critY - deltaY, tY0);

                    return new Point(X, Y);
                }
            }
        }
        throw new Error(`Invalid type object: ${graphType}`);
    }

    /**
     * Correction of ugly output of numeric arrays via JSON.stringify
     * @param match // multi-line for formatting
     * @return string
     */
    protected formatReplacer(match: string): string {
        return match.replace(/\s+/gs, "").replaceAll(",", ", ");
    }

    protected getIndexAndType(object: ObjectInterface) {
        if (object instanceof Position) {
            return { type: ElementType.Position, index: this.positions.indexOf(object) };
        }
        if (object instanceof Transition) {
            return { type: ElementType.Transition, index: this.transitions.indexOf(object) };
        }
        if (object instanceof Arc) {
            return { type: ElementType.Arc, index: this.arcs.indexOf(object) };
        }
    }
}
