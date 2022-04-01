import { toRadians } from "./converter";

export class Point {

    constructor(public x: number, public y: number) {
        this.x = x;
        this.y = y;
    }

    public set(point: Point) {
        this.x = point?.x;
        this.y = point?.y;
    }

    public get(): Point {
        return this;
    }

    public getInverse(): Point {
        return new Point(-this.x, -this.y);
    }

    public add(point: Point): Point {
        return new Point(this.x + point.x, this.y + point.y);
    }

    public multiple(number: number): Point {
        return new Point(this.x * number, this.y * number);
    }

    /**
     * @param angle angle in degrees
     * @param center the point around which the rotation will be
     * @returns transformed point
     */
    public rotate(
        angle: number,
        center: Point
      ): Point {
        const radians = toRadians(angle);
        const X = (this.x - center.x) * Math.cos(radians) - (this.y - center.y) * Math.sin(radians) + center.x;
        const Y = (this.x - center.x) * Math.sin(radians) + (this.y - center.y) * Math.cos(radians) + center.y;
    
        return new Point(X, Y);
    }
}
