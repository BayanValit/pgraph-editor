export default interface Settings {
    debugMode: boolean;
    name: string;
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
