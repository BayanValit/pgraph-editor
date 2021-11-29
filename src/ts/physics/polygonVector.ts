enum Poligons { PoligonA, PoligonB }

/**
 * An object with a set of vectors for determining the collision, direction and force magnitude for polygons
 */
export class PolygonVector {

    public isCollide = false;
    public vectors: [{ X: number, Y: number }[], { X: number, Y: number }[]]

    constructor(poligonA, poligonB) {
      this.vectors = [Array(poligonA.length), Array(poligonB.length)];
    }

    public calcDiscrepancy(): number {
      let discrepancy = 0;
      this.vectors[Poligons.PoligonA].forEach(vector => {
        discrepancy += Math.abs(vector.Y - vector.X);
      });
      this.vectors[Poligons.PoligonB].forEach(vector => {
        discrepancy += Math.abs(vector.Y - vector.X);
      });

      return discrepancy;
    }

    public calcSide(poligon: Poligons = 0): number {
      return this.vectors[poligon].reduce(
        (prev, curr, indexPolygon) => Math.abs(this.vectors[poligon][prev].X - this.vectors[poligon][prev].Y) > Math.abs(curr.X) ? prev : indexPolygon, 0
      );
    }
}
