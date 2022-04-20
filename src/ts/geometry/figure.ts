import Point from "./point";

export default abstract class Figure {

    public x?: number | undefined;
    public y?: number | undefined;

    constructor(center?: Point, public rotateAngle = 0) {
        this.x = center.x;
        this.y = center.y;
    }

    public set center(point: Point) {
        this.x = point?.x;
        this.y = point?.y;
    }

    public get center(): Point {
        return this.x && this.y ? new Point(this.x, this.y) : undefined;
    }
}
