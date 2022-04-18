import AlgorithmInterface from "../algorithmInterface";
import { LayoutSettings } from "../../settings";
import { NodeType } from "../../objects/abstract/node";
import { CollectionData } from "../../graphState";
import Point from "../../geometry/point";

export default class TwoFrontAlgorithm implements AlgorithmInterface {

    constructor(
        public collection: CollectionData,
        public settings: LayoutSettings,
    ) {}

    public setLayout(): CollectionData {
        const collection = this.collection;

        const n = Math.max(collection.positions.length, collection.transitions.length);

        for (let index = 0; index < n; index += 1) {
            if (collection.positions[index] && collection.positions[index].center === undefined) {
                collection.positions[index].setCenter(this.getOptimalPosition(NodeType.Position, index));
            }
            if (collection.transitions[index] && collection.transitions[index].center === undefined) {
                collection.transitions[index].setCenter(this.getOptimalPosition(NodeType.Transition, index));
            }
        }
        return collection;
    }

    protected getOptimalPosition(
        nodeType: NodeType,
        objectNumber: number
    ): Point {
        if (nodeType == NodeType.Position || nodeType == NodeType.Transition) {
    
            // Indentation for the first position...
            const pX0 = this.settings.paddingLeft;
            const pY0 = this.settings.paddingTop;
    
            // ...and for the first transition
            const tX0 = pX0;
            const tY0 = pY0 + this.settings.intervalY;
    
            // Intervals between objects
            let deltaX = this.settings.intervalX;
            let deltaY = this.settings.intervalY;
    
            deltaY *= objectNumber % 2 ? 1 : -1; // Symmetrically relative to the transition center
    
            // Extreme points: The maximum right or top values are among all previous objects
            let extPX = 0, extTX = 0, extPY = 0, extTY = 0;
    
            if (objectNumber) {
                extPX = 0;
                extTX = Math.max(...this.collection.transitions.slice(0, objectNumber).map(t => t.center?.x ?? 0));
                extPY = Math.min(...this.collection.positions.slice(0, objectNumber).map(p => p.center?.y ?? Infinity));
                extTY = Math.min(...this.collection.transitions.slice(0, objectNumber).map(t => t.center?.y ?? Infinity));
            } else {
                deltaX = 0;  // If first
            }
            switch (nodeType) {
                case NodeType.Position: {
                    // Critical points: The value of the alternative object of the current index;
                    const critX = this.collection.transitions[objectNumber]?.center?.x ?? 0;
                    const critY = this.collection.transitions[objectNumber]?.center?.y ?? 0;
    
                    const X = Math.max(extPX + deltaX, pX0 + deltaX, extTX + deltaX, critX);
                    const Y = Math.max(extPY - pY0 + tY0 + deltaY, Math.max(extTY, tY0) + deltaY, objectNumber % 2 ? critY + deltaY : 0, pY0);
    
                    return new Point(X, Y);
                }
                case NodeType.Transition: {
                    const critX = this.collection.positions[objectNumber]?.center?.x ?? 0;
                    const critY = this.collection.positions[objectNumber]?.center?.y ?? 0;
    
                    const X = Math.max(extTX + deltaX, tX0 + deltaX, extPX + deltaX, critX);
                    const Y = Math.max(extTY - tY0 + pY0 + Math.abs(deltaY), objectNumber % 2 ? 0 : critY - deltaY, tY0);
    
                    return new Point(X, Y);
                }
            }
        }
        throw new Error(`Invalid type object: ${nodeType}`);
    }
}
