import Settings from './settings';

export const SETTINGS: Settings = {
    debugMode: true,
    object: {
        // Position Settings
        positionRadius: 40,
        initMarks: 0,
        positionLabelOffsetY: -45,
        positionBorderRadius: 2,

        // Transition Settings
        transitionWidth: 120,
        transitionHeight: 40,

        // Arc Settings
        markerSize: 7,
        marginStart: 15,
        marginEnd: 15,
        oneWayArcSymbol: '➝',
        twoWayArcSymbol: '⮂',
        anchorRadius: 10,
        oneWayArcHideAtLength: 0,
        twoWayArcHideAtLength: 12,
        oneWayArcLabelPattern: ['%w'],
        twoWayArcLabelPattern: ['%ws', ' | ', '%ii%wt'],
        arcLabelOffsetY: -7,
    },
    layout: {
        paddingX: 80,
        paddingY: 80,
        intervalX: 160,
        intervalY: 240,
        pathTension: 0.5 // ∈ [0, 1]
    },
    animation: {
        // Camera animation
        moveCameraOnRedraw: true, // Should not be used with lockCamera
        lockCamera: false,
        moveDuration: 250,

        // Variables
        zoomCamera: null,
        translateCamera: null,

        // Forces
        useForceCenter: false,
        useForceCharge: false,
        forceChargeMaxDistance: 100,
    }
}

export enum ConfigType {
    Regular = 'regular',
    Inhibitor = 'inhibitor'
}

export const DEBUG_PREFIX = 'pgraph-editor';
