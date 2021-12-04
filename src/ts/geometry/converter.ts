import { Point } from "./point.js";
import { Vector } from "./vector.js";

export function toRadians(angle: number) {
    return angle * Math.PI / 180;
}

export function toDegrees(angle: number) {
    return angle * 180 / Math.PI;
}

export function pointToVector(point: Point): Vector {
    return new Vector(point.x, point.y);
}
