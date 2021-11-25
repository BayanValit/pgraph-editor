export default class Constants {
    public static defaultSizes = {
        transitionWidth: 120,
        transitionHeight: 40,
        positionRadius: 40,
        viewportWidth: 1200,
        viewportHeight: 600
    }

    public static defaultPositions = {
        PaddingLeft: 100,
        PaddingTop: 100,
        intervalX: 160, // Optimal: positionRadius * 4
        intervalY: 180 // Optimal: positionRadius * 4 + transitionHeight / 2
    }

    public static defaultName = "Untitled network";
}
