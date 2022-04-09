/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEFAULT_SETTINGS } from "../settings";
import { GraphStateData, ConfigType } from "../graphState";
import { isValidMatrix } from "./matrix";

function autofix(data: any) {
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

    if (!isValidMatrix(data.matrices.FP)) {
        throw new TypeError("Invalid FP matrix");
    }

    if (!isValidMatrix(data.matrices.FT)) {
        throw new TypeError("Invalid FT matrix");
    }

    if (data.type === ConfigType.Inhibitory) {
        if (!isValidMatrix(data.matrices.FI)) {
            throw new TypeError("Invalid FI matrix");
        }
        if (data.matrices.FI.length !== data.matrices.FP.length) {
            throw new TypeError("FI and FP matrices dismatch");
        }
    }
}

export default function graphStateDataFromJson(serialized: string): GraphStateData {
    const data = autofix(JSON.parse(serialized));
    assertIsValid(data);
    const {
        name = DEFAULT_SETTINGS.name,
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