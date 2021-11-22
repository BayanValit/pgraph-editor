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
            const positionPoint = options['position'] ? options['position'] : this.getDefaultPosition(GraphType.Position, key);
            this.positions.push(new Position(positionPoint, config['markup'][key] ?? 0));
        });
        config['matrices']['FT'].forEach((_array, key: number) => {
            const options = config['transitions'] ? config['transitions'][key] ?? [] : [];
            const positionPoint = options['position'] ? options['position'] : this.getDefaultPosition(GraphType.Transition, key);
            this.transitions.push(new Transition(positionPoint, options['rotate'] ? options['rotate'] : 0));
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
                    this.positions[row].bindingTo.push(arc);
                    this.transitions[col].bindingFrom.push(arc);
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
                    this.transitions[row].bindingTo.push(arc);
                    this.positions[col].bindingFrom.push(arc);
                    this.arcs.push(arc);
                }
            });
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
            position.bindingTo.forEach(arc => {
                const col = this.transitions.indexOf(arc.bindingTo as Transition);
                if (col >= 0) {
                    FP[row][col] = arc.multiplicity;
                    FI[row][col] = Number(arc.has_inhibitory);
                }
            });
            markup.push(position.marks);
            positions.push({ position: position.position });
        });

        this.transitions.forEach((transition, row) => {
            transition.bindingTo.forEach(arc => {
                const col = this.positions.indexOf(arc.bindingTo as Position);
                if (col >= 0) {
                    FT[row][col] = arc.multiplicity;
                }
            });
            transitions.push({ position: transition.position, rotate: transition.rotate });
        });

        this.arcs.forEach(arc => {
            const from = this.getIndexAndType(arc.bindingFrom);
            const to = this.getIndexAndType(arc.bindingTo);
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
        
        const json = JSON.stringify(config, null, 2).replace(/\n(\s+\d,?\n)+\s*/gs, this.formatReplacer);
        const link = document.createElement('a');
        const file = new File([json], this.name + ".json", {
            type: "application/json",
        });

        link.download = file.name;
        link.href = URL.createObjectURL(file);
        link.click();
        
        URL.revokeObjectURL(link.href);
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

    protected getDefaultPosition(graphType: GraphType, objectNumber: number): { X: number; Y: number; } {
        // TODO: add delta constants, finish the algorithm
        if (graphType == GraphType.Position || graphType == GraphType.Transition) {
            const deltaX = objectNumber * 160;
            const deltaY = graphType == GraphType.Transition ? 180 : objectNumber % 2 * 360;
            return { X: 100 + deltaX, Y: 100 + deltaY};
        }
        throw new Error("Invalid type object");
    }
}
