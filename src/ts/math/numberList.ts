export default class NumberList extends Array<number> {

    constructor(items: Array<number>) {
        super();
        this.push(...items);
    }

    public static createList(length: number): NumberList {
        return new NumberList(
            new Array(length).fill(0)
        );
    }

    public hasNegative(): boolean {
        return this.reduce((prev, curr) => prev || curr < 0, false);
    }
}
