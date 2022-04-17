import Point from "./point";
import Vector from "./vector";

export default class Line {

    constructor(
        public start: Point,
        public end: Point
    ) {}

    public getVector(): Vector {
        return new Vector(this.end.x - this.start.x, this.end.y - this.start.y);
    }

    // public isReverse(point: Point): boolean {
    //     return Vector.fromPoints(this.start, point).getLength() < Vector.fromPoints(this.end, point).getLength();
    // }
}
