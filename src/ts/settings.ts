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
    // Optimal: positionRadius * 4
    intervalX: number;
    // Optimal: positionRadius * 4 + transitionHeight / 2
    intervalY: number;
    arcMarginStart: number;
    arcMarginEnd: number;
}

export default interface Settings {
    debugMode: boolean;
    name: string;
    sizes: SizesSettings,
    positions: PositionsSettings
}
