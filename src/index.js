/* global window document fetch File URL */
import { JsonConfig } from './lib/JsonConfig.js';
import { GraphRender } from './lib/GraphRender.js';
import { GraphState } from './lib/GraphState.js';

window.onload = function () {
    init().then(() => GraphRender.renderObjects());
    initMouseEvents();
    initKeyboardEvents();
};

function init() {
    // TODO: convert to library
    return fetch("../src/examples/data.example.jsonc").then(function(response) {
        return response.text().then(
            (config) => {
                document.querySelector('#configEditor').innerHTML = config;
                JsonConfig.init(JSON.parse(config));
            }
        ).then(() => GraphState.getInstance().import());
    })
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
    const textConfig = document.querySelector("#configEditor").value;
    // TODO: Describe the logic of error output in a separate class
    document.querySelector('.debugMenu span').innerHTML('❌');

    JsonConfig.init(JSON.parse(textConfig));
    GraphState.getInstance().import();
    GraphRender.renderObjects();
}

function exportConfig() {
    const configJson = GraphState.getInstance().export();
    document.querySelector("#configEditor").value = configJson;

    const link = document.createElement("a");
    const file = new File([configJson], GraphState.getInstance().name + ".json", {
        type: "application/json",
    });

    link.download = file.name;
    link.href = URL.createObjectURL(file);
    link.click();
    
    URL.revokeObjectURL(link.href);
}
