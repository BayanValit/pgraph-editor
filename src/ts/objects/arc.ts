import { Point } from './point.js';
import { Vector } from './vector.js';
import { ObjectInterface } from './object.js';
import { Position } from './position.js';
import { Transition } from './transition.js';
import Settings from '../settings.js';

export class Arc implements d3.SimulationLinkDatum<d3.SimulationNodeDatum>, ObjectInterface {

    public index?: number | undefined;
    public startPoint?: Point;
    public endPoint?: Point;
    public isInverted = false;

    constructor(
        public serial: string,
        public source: Position | Transition,
        public target: Position | Transition,
        public has_inhibitory: boolean,
        public multiplicity: number,
        public anchors: Array<Point>
    ) {}

    public calcArcPoints(): void {
        const [spaceStart, spaceEnd] = [Settings.defaultPositions.arcSpaceStart, Settings.defaultPositions.arcSpaceEnd];
        const vector = new Vector({ x: this.target.x - this.source.x, y: this.target.y - this.source.y });
        let startPoint: Point, endPoint: Point;

        if (this.source instanceof Position) {
            startPoint = this.borderPositionScout(vector, spaceStart, this.source);
        } else {
            startPoint = this.borderTransitionScout(vector, spaceStart, this.source);
        }
        if (this.target instanceof Position) {
            endPoint = this.borderPositionScout(vector.getInverse(), spaceEnd, this.target);
        } else {
            endPoint = this.borderTransitionScout(vector.getInverse(), spaceEnd, this.target);
        }
        const newVector = Vector.fromPoints(startPoint, endPoint);
        const isInverted = Math.sign(newVector.x) != Math.sign(vector.x) || Math.sign(newVector.y) != Math.sign(vector.y);

        if (isInverted) {
            this.startPoint = newVector.getUnitVector().getSecondPoint(startPoint);
            this.endPoint = startPoint;
        } else {
            this.startPoint = startPoint;
            this.endPoint = endPoint;
        }

        this.isInverted = isInverted;
    }

    protected borderPositionScout(
        vector: Vector,
        space: number,
        binding: Position
    ): Point {
        const circeRatio = (binding.radius + space) / vector.getVectorLength();
        return new Point({ x: vector.x * circeRatio + binding.x, y: vector.y * circeRatio + binding.y });
    }

    protected borderTransitionScout(
        vector: Vector,
        space: number,
        binding: Transition
    ): Point {
        const arcAngle = Math.atan2(-vector.x, vector.y);
        const rectAngle = binding.rotate / 180 * Math.PI;
        const rectWithSpace = { width: binding.width + space, height: binding.height + space };
        let cutLength: number;
        if (Math.abs(Math.tan(arcAngle - rectAngle)) < rectWithSpace.width / rectWithSpace.height) {
            cutLength = (rectWithSpace.height) * 0.5 / Math.cos(arcAngle - rectAngle);
        } else {
            cutLength = (rectWithSpace.width) * 0.5 / Math.sin(arcAngle - rectAngle);
        }
        const rectRatio = (Math.abs(cutLength) + space / 2) / vector.getVectorLength();
        return new Point({ x: vector.x * rectRatio + binding.x, y: vector.y * rectRatio + binding.y });
    }
}
