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
        oneWayArcLabelPattern: '%w',
        twoWayArcLabelPattern: '%ws | %ii%wt',
        arcLabelOffsetY: -7,
    },
    layout: {
        paddingX: 80,
        paddingY: 80,
        intervalX: 160,
        intervalY: 180,
        pathTension: 0.5 // ∈ [0, 1]
    },
    animation: {
        // Start animation
        useStartZoom: false,
        useStartTranslate: false,
        startDuration: 250,
        zoomStartFrom: null,
        translateStartFrom: null,

        // Forces
        useForceCenter: false,
        useForceCharge: true,
        forceChargeMaxDistance: 100,
    }
}

export enum ConfigType {
    Default = 'default',
    Inhibitory = 'inhibitory'
}

export const DEBUG_PREFIX = 'pgraph-editor';
