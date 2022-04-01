import { Line } from "./line";
import { Point } from "./point";

export class Path extends Line {

    public points: Point[];

    constructor(
        public anchors: Point[],
        start: Point,
        end: Point
    ) {
        super(start, end);
        anchors.push(end);
        anchors.unshift(start);
        this.points = anchors;
    }
}
