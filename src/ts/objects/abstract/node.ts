import { SimulationNodeDatum } from 'd3-force';
import ObjectInterface from './objectInterface';
import Arc from '../abstract/arc';
import Figure from '../../geometry/figure';

export default interface Node extends Figure, SimulationNodeDatum, ObjectInterface {

    readonly nodeType: NodeType;

    index?: number | undefined;
    vx?: number | undefined;
    vy?: number | undefined;
    fx?: number | null | undefined;
    fy?: number | null | undefined;
    x?: number | undefined;
    y?: number | undefined;

    displayIndex: number;

    source: Array<Arc>;
    target: Array<Arc>;
}

export enum NodeType {
    Position = "P",
    Transition = "T"
}
