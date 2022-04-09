import { default as Vector } from "../geometry/vector";

enum ObjectsEnum { ObjectA, ObjectB }

/**
 * A special object with a set of vectors for determining the collision, direction and force magnitude for objects
 */
export default class CollideVector {

    public isCollide = false;
    public vectors: [Vector[], Vector[]]

    constructor(ObjectA, ObjectB) {
      this.vectors = [Array(ObjectA?.length), Array(ObjectB?.length)];
    }

    public calcDiscrepancy(): number {
      let discrepancy = 0;
      this.vectors[ObjectsEnum.ObjectA].forEach(vector => {
        discrepancy += Math.abs(vector.dy - vector.dx);
      });
      this.vectors[ObjectsEnum.ObjectB].forEach(vector => {
        discrepancy += Math.abs(vector.dy - vector.dx);
      });

      return discrepancy;
    }

    public calcDirection(obj: ObjectsEnum = ObjectsEnum.ObjectA): number {
      return this.vectors[obj].reduce(
        (prev, curr, indexPolygon) => Math.abs(this.vectors[obj][prev].dx - this.vectors[obj][prev].dy) > Math.abs(curr.dx) ? prev : indexPolygon, 0
      );
    }
}
