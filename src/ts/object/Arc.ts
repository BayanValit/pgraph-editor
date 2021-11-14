import { Position } from './Position.js';
import { Transition } from './Transition.js';

export class Arc {
    public bindingFrom: Position | Transition | undefined;
    public bindingTo: Position | Transition | undefined;
    public is_ingibitory: boolean;
    public anchors: Array<{ X: number, Y: number }>;

    constructor(
        bindingFrom: Position | Transition | undefined,
        bindingTo: Position | Transition | undefined,
        is_ingibitory: boolean,
        anchors: { X: number; Y: number; }[]
    ) {
        this.bindingFrom = bindingFrom;
        this.bindingTo = bindingTo;
        this.is_ingibitory = is_ingibitory;
        this.anchors = anchors;
    }

    isValid() {
        return this.bindingFrom && this.bindingTo;
    }
}
