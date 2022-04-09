import { default as Figure } from "./figure";
import { default as Line } from "./line";
import { default as Point } from "./point";
import { default as Vector } from "./vector";

export default class Circle extends Figure {

    constructor(
        center: Point,
        public radius: number
    ) {
        super(center);
    }

    public lineInCircle(line: Line): boolean {
        const unit = Vector.fromPoints(line.start, line.end).getUnitVector();
        const d = Vector.fromPoints(this.center, line.start).scalarMultiply(unit.getBiNormal());

        if (Math.abs(d) > this.radius) {
            return false;
        }
        if (Vector.fromPoints(line.start, this.center).getVectorLength() <= this.radius) {
            return true;
        }

        if (Vector.fromPoints(line.end, this.center).getVectorLength() <= this.radius) {
            return true;
        }
        const start = unit.scalarMultiply(new Vector(line.start.x, line.start.y));
        const end = unit.scalarMultiply(new Vector(line.end.x, line.end.y));
        const center = unit.scalarMultiply(new Vector(this.center.x, this.center.y));

        if (start <= center && center <= end ||
            start >= center && center >= end) {
            return true;
        }

        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected onUpdatedCenter(_center: Point) {
        return;
    }
}
