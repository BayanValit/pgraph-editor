import { CollectionData } from "../graphState";
import { LayoutSettings } from "../settings";

export default interface Layout {

    collection: CollectionData;
    settings: LayoutSettings;

    computeLayout(): CollectionData;
}
