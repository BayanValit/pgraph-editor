export default class Settings {

    public static debugMode = true;
    public static defaultName = "Untitled network";

    public static defaultSizes = {
        transitionWidth: 120,
        transitionHeight: 40,
        positionRadius: 40,
        viewportWidth: 1200,
        viewportHeight: 600,    
        sizeArrow: 7
    }

    public static defaultPositions = {
        // For generate auto positions
        PaddingLeft: 100,
        PaddingTop: 100,
        intervalX: 160, // Optimal: positionRadius * 4 = 160
        intervalY: 180, // Optimal: positionRadius * 4 + transitionHeight / 2 = 180

        arcMarginStart: 15,
        arcMarginEnd: 15,
    }
}
