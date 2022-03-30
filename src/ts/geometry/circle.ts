import { Figure } from "./figure.js";
import { Line } from "./line.js";
import { Point } from "./point.js";
import { Vector } from "./vector.js";

export class Circle extends Figure {

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
        const start = unit.scalarMultiply(line.start);
        const end = unit.scalarMultiply(line.end);
        const center = unit.scalarMultiply(this.center);

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
