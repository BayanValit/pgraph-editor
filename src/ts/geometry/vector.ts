import Line from "./line";
import Point from "./point";

export default class Vector {

    public dx?: number | undefined;
    public dy?: number | undefined;

    constructor(dx: number, dy: number) {
        this.dx = dx;
        this.dy = dy;
    }

    public static fromPoints(start: Point, end: Point): Vector {
        return new Vector(end.x - start.x, end.y - start.y);
    }

    public static fromLine(line: Line): Vector {
        return new Vector(line.end.x - line.start.x, line.end.y - line.start.y);
    }

    public getSecondPoint(firstPoint: Point): Point {
        return new Point(firstPoint.x + this.dx, firstPoint.y + this.dy);
    }

    public scalarMultiply(vector: Vector = this): number {
        return this.dx * vector.dx + this.dy * vector.dy;
    }

    public getVectorLength(): number {
        return Math.sqrt(this.scalarMultiply(this));
    }

    public getUnitVector(): Vector {
        const length = this.getVectorLength();
        return length !== 0 ? new Vector(this.dx / length, this.dy / length) : new Vector(0, 0);
    }

    public getNormal(): Vector {
        return new Vector(-this.dy, this.dx);
    }

    public getBiNormal(): Vector {
        return new Vector(this.dy, -this.dx);
    }

    public getInverse(): Vector {
        return new Vector(-this.dx, -this.dy);
    }

    public isReverse(vector: Vector): boolean {
        return Math.sign(vector.dx) != Math.sign(this.dx) || Math.sign(vector.dy) != Math.sign(this.dy);
    }
}
