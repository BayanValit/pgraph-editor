import { default as Point } from "./point";
import { default as CollideVector } from "../physics/collideVector";
import { default as Vector } from "./vector";
import { default as Figure } from "./figure";

export default class Polygon extends Figure {

    public length: number;

    constructor(public points?: Point[], center: Point = Polygon.getCenter(points), rotateAngle?: number) {
        super(center, rotateAngle);
        this.points = points;
        this.length = points.length;
    }

    public static getCenter(points?: Point[]): Point | undefined {
        if (points === undefined) {
            return undefined;
        }
        return points.reduce(
            (prev, current) => new Point(prev.x + current.x, prev.y + current.y), new Point(0, 0)
        ).multiple(1 / points.length);
    }

    /**
     * @param angle angle in degrees
     * @param center the point around which the rotation will be
     * @returns transformed polygon or rectangle
     */
    public rotate(angle: number, center: Point = this.center) {
        const alpha = angle - this.rotateAngle;
        if (alpha !== 0) {
            this.points = this.points.map(function (point) {
                return point.rotate(alpha, center);
            });
        }
        this.rotateAngle = angle;

        return this;
    }

    public getVector(a: number, b: number): Vector {
        return Vector.fromPoints(this.points[a % this.length], this.points[b % this.length]);
    }

  /**
   * @param polygon The polygon being compared with the current one
   * @return CollideVector object if there is any intersection between the 2 polygons, false otherwise
   */
  public polygonsCollision(b: Polygon): CollideVector | false {
    const polygons = [this, b];
    const min: number[] = [], max: number[] = [];
    let projected: number;

    const result = new CollideVector(this, b);

    for (let indexPolygon = 0; indexPolygon < polygons.length; indexPolygon++) {
        const polygon = polygons[indexPolygon];
        const nextIndexPolygon = (indexPolygon + 1) % 2;
        
        for (let indexEdge = 0; indexEdge < polygon.length; indexEdge++) {

            const edge = polygon.getVector(indexEdge, indexEdge + 1);
            const normal = edge.getNormal();
            
            for (let index = 0; index < polygons.length; index++) {
              min[index] = Infinity, max[index] = -Infinity;

              for (let j = 0; j < polygons[index].length; j++) {
                projected = normal.dx * polygons[index].points[j].x + normal.dy * polygons[index].points[j].y;

                if (projected < min[index]) {
                  min[index] = projected;
                }
                if (projected > max[index]) {
                  max[index] = projected;
                }
              }
            }
            
            if (max[indexPolygon] < min[nextIndexPolygon] || max[nextIndexPolygon] < min[nextIndexPolygon]) {
              return false;
            }
            result.vectors[indexPolygon][indexEdge] = new Vector(max[nextIndexPolygon] - min[indexPolygon], max[indexPolygon] - min[nextIndexPolygon]);
        }
    }
    result.isCollide = true;
    return result;
  }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected onUpdatedCenter(_center: Point) {
        return;
    }
}
