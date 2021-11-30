export class Point {
    public x?: number | undefined;
    public y?: number | undefined;

    constructor(
        point: { x: number, y: number } = undefined,
    ) {
        this.x = point.x;
        this.y = point.y;
    }

    public set(point: { x: number | undefined, y: number | undefined } | undefined) {
        this.x = point?.x;
        this.y = point?.y;
    }

    public get(): { x: number | undefined, y: number | undefined } {
        return { x: this.x, y: this.y };
    }
}
