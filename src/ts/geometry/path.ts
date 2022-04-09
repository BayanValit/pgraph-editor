import { default as Line } from "./line";
import { default as Point } from "./point";

export default class Path extends Line {

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
