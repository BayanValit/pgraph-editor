export type Matrix = number[][];

export function isSquare(matrix: Matrix): boolean {
    return matrix.reduce((carry, row) => carry && row.length === matrix.length, true);
}

export function isValidMatrix(matrix: Matrix): boolean {
    const m = matrix.reduce<number>((carry, row) => row.length === carry ? carry : Number.NaN, (matrix[0] || []).length);
    return Number.isFinite(m);
}