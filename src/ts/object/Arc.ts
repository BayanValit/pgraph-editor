import { Position } from './position.js';
import { Transition } from './transition.js';

export class Arc {
    constructor(
        public source: Position | Transition | undefined,
        public target: Position | Transition | undefined,
        public has_inhibitory: boolean,
        public multiplicity: number,
        public anchors: Array<{ X: number, Y: number }>
    ) {}

    isValid() {
        return this.source && this.target;
    }
}
