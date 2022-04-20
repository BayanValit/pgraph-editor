export default interface Settings {
    debugMode: boolean;
    object: ObjectsSettings;
    layout: LayoutSettings;
    animation: AnimationSettings;
}
export interface ObjectsSettings {
    transitionWidth: number;
    transitionHeight: number;
    positionRadius: number;
    anchorRadius: number;
    sizeArrow: number;
    initPositionMarks: number;
    arcMarginStart: number;
    arcMarginEnd: number;
    oneWayArcSymbol: string;
    twoWayArcSymbol: string;
    oneArcHideAtLength: number;
    twoArcHideAtLength: number;
    oneArcLabelPattern: string;
    twoArcLabelPattern: string;
}
export interface LayoutSettings {
    viewportWidth: number;
    viewportHeight: number;
    paddingLeft: number;
    paddingTop: number;
    intervalX: number; // Optimal: positionRadius * 4
    intervalY: number; // Optimal: positionRadius * 4 + transitionHeight / 2
    pathTension: number;
}

export interface AnimationSettings {
    useStart: boolean;
}
