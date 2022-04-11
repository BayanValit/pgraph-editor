import Settings from './settings';

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
