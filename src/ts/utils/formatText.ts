import Arc from "../objects/abstract/arc";
import OneWayArc from "../objects/oneWayArc";
import TwoWayArc from "../objects/twoWayArc";

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

/**
 * Allowed control symbols:
 * %w  - one arc weight
 * %ws - two arc source weight
 * %wt - two arc target weight
 * %i{text} - inhibitory symbol (only for two arc)
 * %i{text}%w - replaces weight inhibitory mark if two-arc has inhibitory type
 */
export function formatArcLabelText(arc: Arc) {
    if (arc instanceof OneWayArc && !(arc.weight > 1)) {
        return;
    }
    const text = arc.labelPattern.replace(/%i([^\s%]+)(\S*)/g, (_match, inhibitoryMark, replacement) => {
        return arc instanceof TwoWayArc && arc.hasInhibitory ? inhibitoryMark : replacement;
    });

    return text.replace(/%([w|ws|wt]+)/g, (_match, weightType) => {
        switch (weightType) {
            case 'w' : return arc instanceof OneWayArc ? arc.weight.toString(): '';
            case 'ws': return arc instanceof TwoWayArc ? arc.sourceWeight.toString() : '';
            case 'wt': return arc instanceof TwoWayArc ? arc.targetWeight.toString() : '';
        }
    });
}
