import { Point } from "./point.js";

export class Vector {
    public x?: number | undefined;
    public y?: number | undefined;

    constructor({x,y}: {x: number, y :number}) {
        this.x = x;
        this.y = y;
    }

    public static convertPoint(vector: Point): Vector {
        return new Vector({ x: vector.x, y: vector.y});
    }

    public static fromPoints(pointStart: Point, pointEnd: Point): Vector {
        return new Vector({ x: pointEnd.x - pointStart.x, y: pointEnd.y - pointStart.y});
    }

    public getSecondPoint(firstPoint: Point): Point {
        return new Point({ x: this.x + firstPoint.x, y: this.y + firstPoint.y});
    }

    public getVectorLength(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public getUnitVector(): Vector {
        const length = this.getVectorLength();
        return new Vector({ x: this.x / length, y: this.y / length });
    }

    public getPerpendicular(): Vector {
        return new Vector({x: -this.y, y: -this.x});
    }

    public getInverse(): Vector {
        return new Vector({x: -this.x, y: -this.y});
    }
}
