
export default function formatMarkCount(marks: number): string {
    const count = marks.toFixed();
    switch (true) {
        case marks >= 10 ** 8:
            return '∞';
        case marks >= 10 ** 6:
            return digitClipper(marks / (10 ** 6)) + 'M';
        case marks >= 10 ** 3:
            return digitClipper(marks / (10 ** 3)) + 'K';
        default:
            return count; 
    }

    function digitClipper(number: number): string {
        return number.toLocaleString("ru", { maximumFractionDigits: +!(number.toFixed().length > 1) });
    }
}
