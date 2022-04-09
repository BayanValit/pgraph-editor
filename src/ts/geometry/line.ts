import { default as Circle } from "./circle";
import { default as Figure } from "./figure";
import { default as Point } from "./point";
import { default as Rectangle } from "./rectangle";
import { default as Vector } from "./vector";
import { toRadians } from "./converter";

export default class Line {

    constructor(
        public start: Point,
        public end: Point
    ) {}

    public getVector(): Vector {
        return new Vector(this.end.x - this.start.x, this.end.y - this.start.y);
    }

    /**
     * Sets the offset from the center of the linked figure to its edge + a fixed margin.
     * Circles and rectangles are available (any rotation)
     * @param source The first figure 
     * @param target The second figure
     * @param marginStart Margin from the first figure
     * @param marginEnd Margin from the second figure
     * @returns Line
     */
    public marginsToFigures(source: Figure, target: Figure, marginStart = 0, marginEnd = 0): Line {

        let startPoint: Point, endPoint: Point;

        if (source instanceof Circle) {
            startPoint = this.marginCircleScout(marginStart, source);
        } else if (source instanceof Rectangle) {
            startPoint = this.marginRectangleScout(marginStart, source);
        }
        if (target instanceof Circle) {
            endPoint = this.marginCircleScout(marginEnd, target, true);
        } else if (target instanceof Rectangle) {
            endPoint = this.marginRectangleScout(marginEnd, target, true);
        }
        const newVector = Vector.fromPoints(startPoint, endPoint);
        const isReversed = this.getVector().isReverse(newVector);

        if (isReversed) {
            this.start = newVector.getUnitVector().getSecondPoint(startPoint);
            this.end = startPoint;
        } else {
            this.start = startPoint;
            this.end = endPoint;
        }
        return this;
    }

    protected marginCircleScout(
        margin: number,
        object: Circle,
        inverse = false
    ): Point {
        let vector = this.getVector();
        if (inverse) {
            vector = vector.getInverse();
        }
        const circeRatio = (object.radius + margin) / vector.getVectorLength();
        return new Point(vector.dx * circeRatio + object.x, vector.dy * circeRatio + object.y);
    }

    protected marginRectangleScout(
        margin: number,
        object: Rectangle,
        inverse = false
    ): Point {
        let vector = this.getVector();
        if (inverse) {
            vector = vector.getInverse();
        }
        const arcAngle = Math.atan2(-vector.dx, vector.dy);
        const rectAngle = toRadians(object.rotateAngle);
        const rectWithSpace = { width: object.width + margin, height: object.height + margin };
        let cutLength: number;
        if (Math.abs(Math.tan(arcAngle - rectAngle)) < rectWithSpace.width / rectWithSpace.height) {
            cutLength = (rectWithSpace.height) * 0.5 / Math.cos(arcAngle - rectAngle);
        } else {
            cutLength = (rectWithSpace.width) * 0.5 / Math.sin(arcAngle - rectAngle);
        }
        const rectRatio = (Math.abs(cutLength) + margin / 2) / vector.getVectorLength();
        return new Point(vector.dx * rectRatio + object.x, vector.dy * rectRatio + object.y);
    }
}
