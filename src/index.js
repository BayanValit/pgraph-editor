/* global fetch document File URL window console */

import { GraphStateEventType } from '../lib/graphState';
import { GraphState, GraphRender } from '../lib/index';
import { parseFromJsonText, serializeToJson } from '../lib/utils/jsonGraphState';

const graph = {
    state: undefined,
    renderer: undefined,
};

let zoomCamera, translateCamera;

function fetchGraphState() {
    return fetch("./examples/data.example.jsonc")
        .then((res) => res.text())
        .then((serialized) => {
            document.querySelector('#configEditor').innerHTML = serialized;
            return parseFromJsonText(serialized)
        })
        .then((graphStateData) => GraphState.create(graphStateData))
}

function update(state) {
    graph.state = state;
    graph.renderer = new GraphRender('#viewport', { 
        state, 
        settings: {
            animation: { 
                zoomCamera: zoomCamera,
                translateCamera: translateCamera,
            } 
        }
    });

    graph.state.addEventListener(GraphStateEventType.Changed, () => console.log(graph.state));
    graph.state.addEventListener(GraphStateEventType.Zoomed, (e) => {
        zoomCamera = e.detail.zoomCamera;
        translateCamera = e.detail.translateCamera;
    });
}

function initMouseEvents() {
    document.querySelector("#importButton").addEventListener("click", importAndRedraw);
    document.querySelector("#exportButton").addEventListener("click", exportConfig);
}

function initKeyboardEvents() {
    document.addEventListener("keydown", e => {
        if (e.ctrlKey && e.key === "Enter") {
            e.preventDefault();
            importAndRedraw();
            return;
        }
        if (e.ctrlKey && e.key === "e") {
            e.preventDefault();
            exportConfig();
            return;
        }
    });
    document.querySelector("#configEditor").addEventListener("keydown", e => {
        if (e.key === "Tab") {
            e.preventDefault();
            e.target.setRangeText('  ', e.target.selectionStart, e.target.selectionEnd, 'end');
        }
    });
}

function importAndRedraw() {
    const configJson = document.querySelector("#configEditor").value;
    update(GraphState.create(parseFromJsonText(configJson)));
}

function exportConfig() {
    const configJson = serializeToJson(graph.state.getData());
    document.querySelector("#configEditor").value = configJson;

    const link = document.createElement("a");
    const file = new File([configJson], "PetriNet_" + new Date().toISOString() + ".json", {
        type: "application/json",
    });

    link.download = file.name;
    link.href = URL.createObjectURL(file);
    link.click();

    URL.revokeObjectURL(link.href);
}

window.onload = function () {
    fetchGraphState().then((state) => {
        update(state);
    });
    initMouseEvents();
    initKeyboardEvents();
};
