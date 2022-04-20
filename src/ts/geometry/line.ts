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
}
