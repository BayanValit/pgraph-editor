import Line from "./line";
import Point from "./point";
import { curveLinear, line } from 'd3-shape';

export default class Path extends Line {

    public anchors: Array<Point>;

    public pathFunc = line().curve(curveLinear); // Choose your favourite curve type.

    constructor(
        start: Point,
        end: Point,
        anchors: Array<Point>
    ) {
        super(start, end);
        this.anchors = anchors;
    }

    public getPoints(): Array<Point> {
        return [this.start, ...this.anchors, this.end];
    }

    public getPath(): string {
        return this.pathFunc(this.getPoints().map((point) => (point.toArray())));
    }
}
