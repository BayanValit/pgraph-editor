export default interface Settings {
    debugMode: boolean;
    name: string;
    sizes: SizesSettings,
    positions: PositionsSettings
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

export const DEFAULT_SETTINGS: Settings = { 
    debugMode: true,
    name: 'Untitled network',
    sizes: {
        transitionWidth: 120,
        transitionHeight: 40,
        positionRadius: 40,
        viewportWidth: 1200,
        viewportHeight: 600,
        sizeArrow: 7,
    },
    positions: {
        paddingLeft: 100,
        paddingTop: 100,
        intervalX: 160,
        intervalY: 180, 
        arcMarginStart: 15,
        arcMarginEnd: 15,
        initMarks: 0,
    }
}

export const DEBUG_PREFIX = 'pgraph-editor';