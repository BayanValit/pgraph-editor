import { default as Settings } from './settings';

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

export const SVG_RESOURSES = [
    '/img/defs/marker.svg',
    '/img/defs/marks/mark_0.svg',
    '/img/defs/marks/mark_1.svg',
    '/img/defs/marks/mark_2.svg',
    '/img/defs/marks/mark_3.svg',
    '/img/defs/marks/mark_4.svg',
    '/img/defs/marks/mark_5.svg',
    '/img/defs/marks/mark_custom.svg',
];
