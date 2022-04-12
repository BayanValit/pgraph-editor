export default interface Settings {
    debugMode: boolean;
    name: string;
    sizes: SizesSettings;
    positions: PositionsSettings;
}
export interface SizesSettings {
    transitionWidth: number;
    transitionHeight: number;
    positionRadius: number;
    viewportWidth: number;
    viewportHeight: number;   
    sizeArrow: number;
}

export interface PositionsSettings {
    paddingLeft: number;
    paddingTop: number;
    intervalX: number; // Optimal: positionRadius * 4
    intervalY: number; // Optimal: positionRadius * 4 + transitionHeight / 2
    arcMarginStart: number;
    arcMarginEnd: number;
    initMarks: number;
}
