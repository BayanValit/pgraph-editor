import { Vector } from "../objects/vector";

enum PoligonsEnum { PoligonA, PoligonB }

/**
 * An object with a set of vectors for determining the collision, direction and force magnitude for polygons
 */
export class PolygonVector {

    public isCollide = false;
    public vectors: [Vector[], Vector[]]

    constructor(poligonA, poligonB) {
      this.vectors = [Array(poligonA.length), Array(poligonB.length)];
    }

    public calcDiscrepancy(): number {
      let discrepancy = 0;
      this.vectors[PoligonsEnum.PoligonA].forEach(vector => {
        discrepancy += Math.abs(vector.y - vector.x);
      });
      this.vectors[PoligonsEnum.PoligonB].forEach(vector => {
        discrepancy += Math.abs(vector.y - vector.x);
      });

      return discrepancy;
    }

    public calcSide(poligon: PoligonsEnum = 0): number {
      return this.vectors[poligon].reduce(
        (prev, curr, indexPolygon) => Math.abs(this.vectors[poligon][prev].x - this.vectors[poligon][prev].y) > Math.abs(curr.x) ? prev : indexPolygon, 0
      );
    }
}
