import { Line } from "./line.js";
import { Point } from "./point.js";

export class Vector {
    public x?: number | undefined;
    public y?: number | undefined;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public static fromPoints(start: Point, end: Point): Vector {
        return new Vector(end.x - start.x, end.y - start.y);
    }

    public static fromLine(line: Line): Vector {
        return new Vector(line.end.x - line.start.x, line.end.y - line.start.y);
    }

    public getSecondPoint(firstPoint: Point): Point {
        return new Point(this.x + firstPoint.x, this.y + firstPoint.y);
    }

    public scalarMultiply(vector: Vector | Point = this): number {
        return this.x * vector.x + this.y * vector.y;
    }

    public getVectorLength(): number {
        return Math.sqrt(this.scalarMultiply(this));
    }

    public getUnitVector(): Vector {
        const length = this.getVectorLength();
        return new Vector(this.x / length, this.y / length);
    }

    public getNormal(): Vector {
        return new Vector(-this.y, this.x);
    }

    public getBiNormal(): Vector {
        return new Vector(this.y, -this.x);
    }

    public getInverse(): Vector {
        return new Vector(-this.x, -this.y);
    }

    public isReverse(vector: Vector): boolean {
        return Math.sign(vector.x) != Math.sign(this.x) || Math.sign(vector.y) != Math.sign(this.y);
    }
}
