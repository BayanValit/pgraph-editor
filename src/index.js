/* global fetch document File URL window console */

import { GraphState, GraphRender } from '../lib/index';
import { parseFromJson, serializeToJson }from '../lib/utils/jsonGraphState';

const graph = {
    state: undefined,
    renderer: undefined,
};

function fetchGraphState() {
    return fetch("./examples/data.example.jsonc")
        .then((res) => res.text())
        .then((serialized) => {
            document.querySelector('#configEditor').innerHTML = serialized;
            return parseFromJson(serialized)
        })
        .then((graphStateData) => GraphState.create(graphStateData))
}

function update(state) {
    graph.state = state;
    graph.renderer = new GraphRender('#viewport', { state })
    graph.renderer.render();
    graph.state.addEventListener('changed', () => console.log(graph.state));
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
}

function importAndRedraw() {
    const configJson = document.querySelector("#configEditor").value;
    // TODO: Describe the logic of error output in a separate class
    document.querySelector('.debugMenu span').innerHTML = '❌';
    update(GraphState.create(parseFromJson(configJson)));
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
    document.getElementById("debugPanel").style.display = "flex";

    fetchGraphState().then((state) => {
        update(state);
    });
    initMouseEvents();
    initKeyboardEvents();
};
