import { CollectionData } from "../graphState";
import { LayoutSettings } from "../settings";

export default interface LayoutAlgorithm {

    collection: CollectionData;
    settings: LayoutSettings;

    computeLayout(): CollectionData;
}
