export default interface Settings {
    debugMode: boolean;
    object: ObjectsSettings;
    layout: LayoutSettings;
    animation: AnimationSettings;
}
export interface ObjectsSettings {
    // Position Settings
    positionRadius: number;
    initMarks: number;
    positionLabelOffsetY: number;
    positionBorderRadius: number;

    // Transition Settings
    transitionWidth: number;
    transitionHeight: number;

    // Arc Settings
    markerSize: number;
    marginStart: number;
    marginEnd: number;
    oneWayArcSymbol: string;
    twoWayArcSymbol: string;
    anchorRadius: number;
    oneWayArcHideAtLength: number;
    twoWayArcHideAtLength: number;
    oneWayArcLabelPattern: string[];
    twoWayArcLabelPattern: string[];
    arcLabelOffsetY: number;
    arcTension: number;
}
export interface LayoutSettings {
    paddingX: number;
    paddingY: number;
    baseIntervalX: number; // Optimal: positionRadius * 4
    baseIntervalY: number; // Optimal: positionRadius * 4 + transitionWidth
}

export interface AnimationSettings {
    // Camera animation
    moveCameraOnRedraw: boolean;
    lockCamera: boolean;
    moveDuration: number | null;
    
    // Variables
    zoomCamera: number | null;
    translateCamera: { x: number, y: number } | null;

    // Forces
    useForceCenter: boolean;
    useForceCharge: boolean;
    forceChargeMaxDistance: number;
}

export function mergeSettings(baseSettings: Settings, settings?: Partial<Settings>) {
    return {
        ...baseSettings,
        ...settings,
        object: {
            ...baseSettings.object,
            ...(settings?.object ?? {})
        },
        layout: {
            ...baseSettings.layout,
            ...(settings?.layout ?? {})
        },
        animation: {
            ...baseSettings.animation,
            ...(settings?.animation ?? {})
        },
    }
}
