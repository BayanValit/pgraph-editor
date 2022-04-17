/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigType, DEFAULT_SETTINGS } from "../constants";
import NumberList from "../math/numberList";
import Matrix from "../math/matrix";
import Point from "../geometry/point";

type PositionData   = { center: Point };
type TransitionData = { center: Point, rotate: number };
type ArcData        = { binding: string, anchors: Array<{ x: number, y: number }> };

export type GraphStateData = {
    name: string;
    type: ConfigType;
    markup: number[];
    matrices: {
        FP: Matrix;
        FT: Matrix;
        FI?: Matrix;
    },
    positions  : Array<PositionData>;
    transitions: Array<TransitionData>;
    arcs       : Array<ArcData>;
}

export function serializeToJson(data: GraphStateData): string {
    return JSON.stringify(data, null, 2).replace(/\n(\s+\d+,?\n)+\s*/gs, formatReplacer);
}

/**
 * Correction of ugly output of numeric arrays via JSON.stringify
 * @param match // multi-line for formatting
 * @return string
 */
function formatReplacer(match: string): string {
    return match.replace(/\s+/gs, "").replaceAll(",", ", ");
}

export function parseFromJson(serialized: string): GraphStateData {
    const data = autofix(JSON.parse(serialized));
    assertIsValid(data);
    const {
        name,
        type,
        markup,
        matrices,
        positions,
        transitions,
        arcs
    } = data;
    return {
        name,
        type,
        markup,
        matrices,
        positions,
        transitions,
        arcs,
    };
}

function autofix(data: any) {
    data.name ??= DEFAULT_SETTINGS.name;
    data.type ??= ConfigType.Default;
    if (data.type == ConfigType.Inhibitory) {
        data.matrices.FI ??= Array.from(data.matrices.FP as Array<number[]>, x => x.fill(0));
    }

    const setArray = (array: Array<any>) => Array.isArray(array) ? array : [];

    data.markup      = setArray(data.markup);
    data.positions   = setArray(data.positions);
    data.transitions = setArray(data.transitions);
    data.arcs        = setArray(data.arcs);

    return data;
}

function assertIsValid(data: any): void | never {
    if (!Object.values(ConfigType).includes(data.type)) {
        throw new TypeError("Invalid type net: " + data["type"]);
    }
    assertMatricesValid(data);

    if (new NumberList(data.markup).hasNegative()) {
        throw new TypeError(`The markup has negative value`);
    }
}

function assertMatricesValid(data: any): void | never {
    const matrices = {
        FP: new Matrix(data.matrices.FP),
        FT: new Matrix(data.matrices.FT),
    };

    if (data.type === ConfigType.Inhibitory) {
        matrices['FI'] = new Matrix(data.matrices.FI);
    }

    for (const key in matrices) {
        if (!matrices[key].isMatrix()) {
            throw new TypeError(`Invalid ${key} matrix`);
        }
        if (matrices[key].hasNegativeValue()) {
            throw new TypeError(`Matrix ${key} has negative value`);
        }
    }

    /* TODO: Улучшение валидации конфигурации - не применять правила ниже, если нет конфликта между матрицами
     *
     * Конфликт возникает, если дуга существует, но не заданы объекты для этой дуги.
     * Решение этой проблемы позволит сохранять конфигурацию, при которой существуют только позиции,
     * либо только переходы, также задействует автоисправление при несовместимых матрицах.
     */
    if (!matrices.FP.сompareColsWithRows(matrices.FT)) {
        throw new TypeError("FP and FT matrices dismatch");
    }

    if (data.type === ConfigType.Inhibitory && !matrices.FP.сompareRowsWithRows(matrices['FI'])) {
        throw new TypeError("FI and FP matrices dismatch");
    }
}
