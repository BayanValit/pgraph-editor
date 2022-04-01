import { Vector } from "../geometry/vector";

enum ObjectsEnum { ObjectA, ObjectB }

/**
 * A special object with a set of vectors for determining the collision, direction and force magnitude for objects
 */
export class CollideVector {

    public isCollide = false;
    public vectors: [Vector[], Vector[]]

    constructor(ObjectA, ObjectB) {
      this.vectors = [Array(ObjectA?.length), Array(ObjectB?.length)];
    }

    public calcDiscrepancy(): number {
      let discrepancy = 0;
      this.vectors[ObjectsEnum.ObjectA].forEach(vector => {
        discrepancy += Math.abs(vector.y - vector.x);
      });
      this.vectors[ObjectsEnum.ObjectB].forEach(vector => {
        discrepancy += Math.abs(vector.y - vector.x);
      });

      return discrepancy;
    }

    public calcDirection(obj: ObjectsEnum = ObjectsEnum.ObjectA): number {
      return this.vectors[obj].reduce(
        (prev, curr, indexPolygon) => Math.abs(this.vectors[obj][prev].x - this.vectors[obj][prev].y) > Math.abs(curr.x) ? prev : indexPolygon, 0
      );
    }
}
