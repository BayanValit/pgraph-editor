/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEFAULT_SETTINGS } from "../constants";
import { GraphStateData, ConfigType } from "../graphState";
import NumberList from "../math/numberList";
import Matrix from "../math/matrix";

export default function graphStateDataFromJson(serialized: string): GraphStateData {
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

    if (!Array.isArray(data.markup)) {
        data.markup = [];
    }
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

    if (!matrices.FP.сompareColsWithRows(matrices.FT)) {
        throw new TypeError("FP and FT matrices dismatch");
    }

    if (data.type === ConfigType.Inhibitory && !matrices.FP.сompareRowsWithRows(matrices['FI']) ) {
        throw new TypeError("FI and FP matrices dismatch");
    }
}
