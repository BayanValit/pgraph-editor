import Settings from './settings';

export const DEFAULT_SETTINGS: Settings = {
    debugMode: true,
    name: 'Untitled network',
    object: {
        transitionWidth: 120,
        transitionHeight: 40,
        positionRadius:   40,
        anchorRadius:     10,
        arcMarginStart:   15,
        arcMarginEnd:     15,
        sizeArrow:         7,
        initPositionMarks: 0,
        oneWayArcSymbol: '➝',
        twoWayArcSymbol: '⮂'
    },
    layout: {
        viewportWidth: 1200,
        viewportHeight: 600,
        paddingLeft: 100,
        paddingTop: 100,
        intervalX: 160,
        intervalY: 180,
        pathTension: 0.5 // ∈ [0, 1]
    },
    animation: {
        useStart: true
    }
}

export enum ConfigType {
    Default = 'default',
    Inhibitory = 'inhibitory'
}

export const DEBUG_PREFIX = 'pgraph-editor';
