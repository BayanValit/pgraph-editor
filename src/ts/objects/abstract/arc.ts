import { SimulationLinkDatum, SimulationNodeDatum } from 'd3';
import Point from '../../geometry/point';
import ObjectInterface from './objectInterface';
import Node from './node';
import Path from '../../geometry/path';
import Circle from '../../geometry/circle';
import Rectangle from '../../geometry/rectangle';
import Vector from '../../geometry/vector';
import { toRadians } from '../../geometry/converter';
import { SETTINGS } from '../../constants';

export default abstract class Arc extends Path implements SimulationLinkDatum<SimulationNodeDatum>, ObjectInterface {

    public marginStart = SETTINGS.object.marginStart;
    public marginEnd = SETTINGS.object.marginEnd;
    public startSegmentReversed = false;
    public endSegmentReversed = false;
    public isReverse = false;
    public labelInverted = false;
    public labelPattern: string[];
    public labelText: string;
    public linkSymbol: string;
    public hideAtLength: number;

    constructor(
        public source: Node,
        public target: Node,
        public hasInhibitory: boolean = false,
        anchors: Array<Point>
    ) {        
        super(source.center, target.center, anchors);
    }

    public updateMargins(): void {
        this.calcMarginsToFigures();
    }

    public getSerial(serialReverse = false): string {
        const [first, last] = serialReverse ? [this.target, this.source] : [this.source, this.target];
        return first.nodeType + first.displayIndex + this.linkSymbol + last.nodeType + last.displayIndex;
    }
    
    public getFullPath(): string {
        return Path.toSvgPath([this.source.center, ...this.anchors, this.target.center]);
    }

    public invertLabel(): boolean  {
        if (this.getVector().dx < 0 != this.labelInverted) {
            this.labelInverted = !this.labelInverted;
            return true;
        }
        return false;
    }
    
    public shouldHide(): boolean {
        return this.getVector().getLength() * (this.isReverse ? -1 : 1) < this.hideAtLength;
    }

    /**
     * @todo refactoring
     *
     * Sets the offset from the center of the linked figure to its edge + a fixed margin.
     * Circles and rectangles are available (any rotation)
     */
    private calcMarginsToFigures(): void {
        
        const anchorsAll = [this.source.center, ...this.anchors, this.target.center];
        
        // alias indexes
        const [first, second, penultimate, last] = [0, 1, anchorsAll.length - 2, anchorsAll.length - 1];

        const vectorFrom = Vector.fromPoints(anchorsAll[first], anchorsAll[second]);
        const vectorTo   = Vector.fromPoints(anchorsAll[penultimate], anchorsAll[last]);

        const scoutFunction = (margin: number, object: Node, vector: Vector, inverse = false) => {
            if (object instanceof Circle) {
                return this.marginCircleScout(margin, object, vector, inverse);
            }
            if (object instanceof Rectangle) {
                return this.marginRectangleScout(margin, object, vector, inverse);
            }
        };       

        anchorsAll[first] = scoutFunction(this.marginStart, this.source, vectorFrom);
        anchorsAll[last]  = scoutFunction(this.marginEnd, this.target, vectorTo, true);

        const newVectorFrom = Vector.fromPoints(anchorsAll[first], anchorsAll[second]);
        const newVectorTo   = Vector.fromPoints(anchorsAll[penultimate], anchorsAll[last]);

        this.startSegmentReversed = vectorFrom.isReverse(newVectorFrom);
        this.endSegmentReversed   = vectorTo.isReverse(newVectorTo);
        
        const startToTarget = Vector.fromPoints(anchorsAll[first], this.target.center).getLength();
        const endToTarget   = Vector.fromPoints(anchorsAll[last], this.target.center).getLength();
        this.isReverse = startToTarget < endToTarget;

        this.start = this.startSegmentReversed ? anchorsAll[second] : anchorsAll[first];
        this.end = this.endSegmentReversed ? anchorsAll[penultimate] : anchorsAll[last];
    }

    private marginCircleScout(
        margin: number,
        object: Circle,
        vector: Vector,
        inverse = false
    ): Point {
        vector = inverse ? vector.getInverse() : vector;
        const circeRatio = (object.radius + margin) / vector.getLength();
        return new Point(vector.dx * circeRatio + object.x, vector.dy * circeRatio + object.y);
    }

    private marginRectangleScout(
        margin: number,
        object: Rectangle,
        vector: Vector,
        inverse = false
    ): Point {

        vector =  inverse ? vector.getInverse() : vector;

        const arcAngle = Math.atan2(-vector.dx, vector.dy);
        const rectAngle = toRadians(object.rotateAngle);
        const rectWithSpace = { width: object.width + margin, height: object.height + margin };

        let cutLength = (rectWithSpace.width) * 0.5 / Math.sin(arcAngle - rectAngle);

        if (Math.abs(Math.tan(arcAngle - rectAngle)) < rectWithSpace.width / rectWithSpace.height) {
            cutLength = (rectWithSpace.height) * 0.5 / Math.cos(arcAngle - rectAngle);
        }

        const rectRatio = (Math.abs(cutLength) + margin / 2) / vector.getLength();
        
        return new Point(vector.dx * rectRatio + object.x, vector.dy * rectRatio + object.y);
    }
}
