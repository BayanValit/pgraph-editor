import { JsonConfig, ConfigType } from './jsonConfig.js';
import { Arc } from './object/arc.js';
import { Position } from './object/position.js';
import { Transition } from './object/transition.js';

enum GraphType { Position , Transition , Arc }

export class GraphState {
    private static instance: GraphState;

    public positions: Array<Position> = [];
    public transitions: Array<Transition> = [];
    public arcs: Array<Arc> = [];
    public name: string;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    public static getInstance(): GraphState {
        if (!GraphState.instance) {
            GraphState.instance = new GraphState().import();
        }
        return GraphState.instance;
    }

    public import() {
        this.positions = [];
        this.transitions = [];
        this.arcs = [];
        const config: JSON = JsonConfig.get();
        this.name = config['name'] ?? "Default network name";

        config['matrices']['FP'].forEach((_array, key: number) => {
            const options = config['positions'][key] ?? [];
            const positionPoint = options['position'] ? options['position'] : this.getDefaultPosition(GraphType.Position, key);
            this.positions.push(new Position(positionPoint, config['markup'][key] ?? 0));
        });
        config['matrices']['FT'].forEach((_array, key: number) => {
            const options = config['transitions'][key] ?? [];
            const positionPoint = options['position'] ? options['position'] : this.getDefaultPosition(GraphType.Transition, key);
            this.transitions.push(new Transition(positionPoint, options['rotate'] ? options['rotate'] : 0));
        });
        config['matrices']['FP'].forEach((array, row: number) => {
            array.forEach((element, col: number) => {
                if (element) {
                    const arc_serial = 'P' + (row + 1) + '-T' + (col + 1);
                    const options = config['arcs'][arc_serial];
                    const arc = new Arc(
                        this.positions[row],
                        this.transitions[col],
                        config['type'] == ConfigType.Inhibitory ? Boolean(config['matrices']['FI'][row][col]) : false,
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
                    const options = config['arcs']['T' + (row + 1) + '-P' + (col + 1)];
                    const arc = new Arc(
                        this.positions[row],
                        this.transitions[col],
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

    // TODO: public export() - export state to JSONConfig

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
