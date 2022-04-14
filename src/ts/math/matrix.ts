import NumberList from "./numberList";

export default class Matrix extends Array<NumberList> {

    constructor(items: Array<NumberList>) {
        super();
        this.push(...items.map(item => new NumberList(item)));
    }

    public static createMatrix(rows: number, cols: number): Matrix {
        return new Matrix(
            (new Array(rows).fill(undefined).map(() => new Array(cols).fill(0)) as NumberList[])
        );
    }

    public isMatrix(): boolean {
        const m = this.reduce<number>(
            (carry, row) => row.length === carry ? carry : Number.NaN, (this[0] || []).length
        );
        return Number.isFinite(m);
    }

    public сompareRowsWithRows(comparedMatrix: Matrix): boolean {
        return this.length === comparedMatrix.length;
    }

    public сompareColsWithRows(comparedMatrix: Matrix): boolean {
        return this.reduce((carry, row) => carry && row.length === comparedMatrix.length, true);
    }

    public isSquareMatrix(): boolean {
        return this.сompareColsWithRows(this);
    }

    public hasNegativeValue(): boolean {
        if (this.some(numberList => (numberList as NumberList).hasNegative())) {
            return true;
        }
        return false;
    }
}
