import { JsonConfig, ConfigType } from './jsonConfig.js';
import { Arc } from './object/arc.js';
import { Position } from './object/position.js';
import { Transition } from './object/transition.js';
import { default as Constants } from './constants.js';

enum GraphType { Position = 'P' , Transition = 'T' , Arc = 'A' }

export class GraphState {
    private static instance: GraphState;

    public positions: Array<Position> = [];
    public transitions: Array<Transition> = [];
    public arcs: Array<Arc> = [];
    public name: string;
    public type: ConfigType;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    public static getInstance(): GraphState {
        if (!GraphState.instance) {
            GraphState.instance = new GraphState();
        }
        return GraphState.instance;
    }

    public import() {
        this.positions = [];
        this.transitions = [];
        this.arcs = [];

        const config: JSON = JsonConfig.get();

        this.name = config['name'] ??= Constants.defaultName;
        this.type = config['type'];

        config['matrices']['FP'].forEach((_array, key: number) => {
            const options = config['positions'] ? config['positions'][key] ?? [] : [];
            this.positions.push(new Position(options['position'], config['markup'][key] ?? 0));
        });
        config['matrices']['FT'].forEach((_array, key: number) => {
            const options = config['transitions'] ? config['transitions'][key] ?? [] : [];
            this.transitions.push(new Transition(options['position'], options['rotate'] ? options['rotate'] : 0));
        });
        config['matrices']['FP'].forEach((array, row: number) => {
            array.forEach((element, col: number) => {
                if (element) {
                    const arc_serial = 'P' + (row + 1) + '-T' + (col + 1);
                    
                    const options = config['arcs'] ? (config['arcs'] as []).find(x => x['binding'] == arc_serial) ?? [] : [];
                    const arc = new Arc(
                        this.positions[row],
                        this.transitions[col],
                        this.type == ConfigType.Inhibitory ? Boolean(config['matrices']['FI'][row][col]) : false,
                        element,
                        options ? options['anchors'] : []
                    );
                    this.positions[row].target.push(arc);
                    this.transitions[col].source.push(arc);
                    this.arcs.push(arc);
                }
            });
        });
        config['matrices']['FT'].forEach((array, row: number) => {
            array.forEach((element, col: number) => {
                if (element) {
                    const arc_serial = 'T' + (row + 1) + '-P' + (col + 1);
                    const options = config['arcs'] ? (config['arcs'] as []).find(x => x['binding'] == arc_serial) ?? [] : [];
                    const arc = new Arc(
                        this.transitions[row],
                        this.positions[col],
                        false,
                        element,
                        options ? options['anchors'] : []
                    );
                    this.transitions[row].target.push(arc);
                    this.positions[col].source.push(arc);
                    this.arcs.push(arc);
                }
            });
        });

        [...Array(Math.max(this.positions.length, this.transitions.length)).keys()].forEach((index) => {
            if (this.positions[index] instanceof Position && this.positions[index]?.position === undefined) {
                this.positions[index].position = this.getOptimalPosition(GraphType.Position, index);
            }
            if (this.transitions[index] instanceof Transition && this.transitions[index]?.position === undefined) {
                this.transitions[index].position = this.getOptimalPosition(GraphType.Transition, index);
            }
        });
        console.log('Import completed successfully');
        return this;
    }

    public export() {
        const matrixCreator = (rows, cols) => new Array(rows).fill(null).map(() => new Array(cols).fill(0));

        const FP = matrixCreator(this.positions.length, this.transitions.length);
        const FT = matrixCreator(this.transitions.length, this.positions.length);
        const FI = matrixCreator(this.positions.length, this.transitions.length);
        const markup = [];

        const positions = [];
        const transitions = [];
        const arcs = [];
        
        this.positions.forEach((position, row) => {
            position.target.forEach(arc => {
                const col = this.transitions.indexOf(arc.target as Transition);
                if (col >= 0) {
                    FP[row][col] = arc.multiplicity;
                    FI[row][col] = Number(arc.has_inhibitory);
                }
            });
            markup.push(position.marks);
            positions.push({ position: position.position });
        });

        this.transitions.forEach((transition, row) => {
            transition.target.forEach(arc => {
                const col = this.positions.indexOf(arc.target as Position);
                if (col >= 0) {
                    FT[row][col] = arc.multiplicity;
                }
            });
            transitions.push({ position: transition.position, rotate: transition.rotate });
        });

        this.arcs.forEach(arc => {
            const from = this.getIndexAndType(arc.source);
            const to = this.getIndexAndType(arc.target);
            const binding = from.type + (from.index + 1) + '-' + to.type + (to.index + 1);
            arcs.push({ binding, anchors: arc.anchors });
        });

        const matrices = { FP, FT, FI };

        if (this.type == ConfigType.Default) {
            matrices.FI = null;
        }

        const config = {
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

    public getOptimalPosition(graphType: GraphType, objectNumber: number): { X: number; Y: number; } {
        if (graphType == GraphType.Position || graphType == GraphType.Transition) {
            const { ...defaults } = { ...Constants.defaultPositions };

            // Indentation for the first position...
            const pX0 = defaults.PaddingLeft;
            const pY0 = defaults.PaddingTop;

            // ...and for the first transition
            const tX0 = pX0;
            const tY0 = pY0 + defaults.intervalY;

            // Intervals between objects
            let deltaX = defaults.intervalX;
            let deltaY = defaults.intervalY;
            
            deltaY *= objectNumber % 2 ? 1 : -1; // Symmetrically relative to the transition center

            // Extreme points: The maximum right or top values are among all previous objects
            let extPX = 0, extTX = 0, extPY = 0, extTY = 0;

            if (objectNumber) {
                extPX = Math.max(...this.positions.slice(0, objectNumber).map(p => p.position?.X ?? 0));
                extTX = Math.max(...this.transitions.slice(0, objectNumber).map(t => t.position?.X ?? 0));
                extPY = Math.min(...this.positions.slice(0, objectNumber).map(p => p.position?.Y ?? Infinity));
                extTY = Math.min(...this.transitions.slice(0, objectNumber).map(t => t.position?.Y ?? Infinity));
            } else {
                deltaX = 0;  // If first
            }
            switch (graphType) {
                case GraphType.Position: {
                    // Critical points: The value of the alternative object of the current index;
                    const critX = this.transitions[objectNumber]?.position?.X ?? 0;
                    const critY = this.transitions[objectNumber]?.position?.Y ?? 0;

                    const X = Math.max(extPX + deltaX, pX0 + deltaX, extTX + deltaX, critX);
                    const Y = Math.max(extPY - pY0 + tY0 + deltaY, Math.max(extTY, tY0) + deltaY, objectNumber % 2 ? critY + deltaY : 0, pY0);

                    return { X, Y };
                }
                case GraphType.Transition: {
                    const critX = this.positions[objectNumber]?.position?.X ?? 0;
                    const critY = this.positions[objectNumber]?.position?.Y ?? 0;
                    
                    const X = Math.max(extTX + deltaX, tX0 + deltaX, extPX + deltaX, critX); 
                    const Y = Math.max(extTY - tY0 + pY0 + Math.abs(deltaY), objectNumber % 2 ? 0 : critY - deltaY, tY0);

                    return { X, Y };
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
        return match.replace(/\s+/gs, '').replaceAll(',', ', ');
    }

    protected getIndexAndType(object: Position | Transition | Arc ) {
        if (object instanceof Position) {
            return { type: GraphType.Position, index: this.positions.indexOf(object) };
        }
        if (object instanceof Transition) {
            return { type: GraphType.Transition, index: this.transitions.indexOf(object) };
        }
        if (object instanceof Arc) {
            return { type: GraphType.Arc, index: this.arcs.indexOf(object) };
        }
    }
}
