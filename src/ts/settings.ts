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
    oneWayArcLabelPattern: string;
    twoWayArcLabelPattern: string;
    arcLabelOffsetY: number;
}
export interface LayoutSettings {
    paddingX: number;
    paddingY: number;
    intervalX: number; // Optimal: positionRadius * 4
    intervalY: number; // Optimal: positionRadius * 4 + transitionHeight / 2
    pathTension: number;
}

export interface AnimationSettings {
    zoomStartFrom: number;
    zoomStartDuration: number;
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
