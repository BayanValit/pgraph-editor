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
    },
    layout: {
        viewportWidth: 1200,
        viewportHeight: 600,
        paddingLeft: 100,
        paddingTop: 100,
        intervalX: 160,
        intervalY: 180,
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
