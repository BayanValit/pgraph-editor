import { LayoutSettings } from "../../settings";
import { CollectionData } from "../../graphState";
import Layout from "../layout";

export default abstract class LayoutAlgorithm implements Layout {

    public readonly canExpand;

    constructor(
        public collection: CollectionData,
        public settings: LayoutSettings,
    ) {}

    public computeLayout(): CollectionData {
        const collection = this.collection;
        const hasUnknownCenters = ![...collection.positions, ...collection.transitions].every((node) => node.center);
        if (hasUnknownCenters) {
            this.applyLayout();
        }
        return this.collection;
    }

    public applyLayout(): void | never {
        throw new Error("Unexpected method call in an abstract class");
    }

    public addNewNode(): void | never {
        throw new Error("Unexpected method call in an abstract class");
    }
}
