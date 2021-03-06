import Point from "./point";

export default abstract class Figure {

    public x?: number | undefined;
    public y?: number | undefined;

    constructor(center?: Point | { x: number, y: number }, public rotateAngle = 0) {
        this.x = center?.x;
        this.y = center?.y;
    }

    public set center(point: Point | { x: number, y: number }) {
        this.x = point?.x;
        this.y = point?.y;
    }

    public get center(): Point {
        return this.x === undefined || this.y === undefined ? undefined : new Point(this.x, this.y);
    }
}
