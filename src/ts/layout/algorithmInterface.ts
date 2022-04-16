import { CollectionData } from "../graphState";
import { LayoutSettings } from "../settings";

export default interface AlgorithmInterface {

    collection: CollectionData;
    settings: LayoutSettings;

    setLayout(): CollectionData;
}
