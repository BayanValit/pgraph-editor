import { Point } from "./point.js";
import { Polygon } from "./polygon.js";
import { Vector } from "./vector.js";

export class Rectangle extends Polygon {

    public length = 4;

    constructor(
        public width: number,
        public height: number,
        center: Point,
        rotateAngle?: number
    ) {
        super([
            new Point(center.x - width / 2, center.y - height / 2),
            new Point(center.x + width / 2, center.y - height / 2),
            new Point(center.x + width / 2, center.y + height / 2),
            new Point(center.x - width / 2, center.y + height / 2)
        ], center, rotateAngle);
    }

    public pointInRectangle(point: Point): boolean {
        const AB = this.getVector(0, 1);
        const BC = this.getVector(1, 2);
        const AP = Vector.fromPoints(this.points[0], point);
        const BP = Vector.fromPoints(this.points[1], point);
  
        const dotABAP = AB.scalarMultiply(AP);
        const dotABAB = AB.scalarMultiply();
        const dotBCBP = BC.scalarMultiply(BP);
        const dotBCBC = BC.scalarMultiply();

        if (0 <= dotABAP && dotABAP <= dotABAB &&
            0 <= dotBCBP && dotBCBP <= dotBCBC) {
            return true;
        }
        return false;
    }
}
