import Line from "./line";
import Point from "./point";
import { curveCardinal, line } from 'd3-shape';
import { SETTINGS } from "../constants";

export default class Path extends Line {

    public anchors: Array<Point>;

    // NOTE: Choose your favourite curve type
    public static pathFunc = line().curve(curveCardinal.tension(SETTINGS.layout.pathTension));

    constructor(
        start: Point,
        end: Point,
        anchors: Array<Point>
    ) {
        super(start, end);
        this.anchors = anchors;
    }

    public static toSvgPath(points: Array<Point>): string {
        return this.pathFunc(points.map((point) => (point.toArray())));
    }

    public getPoints(): Array<Point> {
        return [this.start, ...this.anchors, this.end];
    }

    public getPath(): string {
        return Path.toSvgPath(this.getPoints());
    }
}
