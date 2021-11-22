import { JsonConfig } from './jsonConfig.js';
import { GraphRender } from './graphRender.js';
import { GraphState } from './graphState.js';

window.onload = function () {
    init().then(() => GraphRender.renderObjects());
    initMouseEvents();
    initKeyboardEvents();
};

function init() {
    // TODO: Drop to default path, add custom
    return fetch('../src/examples/data.example.jsonc').then(function(response) {
        return response.text().then(
            (config) => {
                d3.select("#configEditor").html(config);
                JsonConfig.init(JSON.parse(config));
            }
        ).then(() => GraphState.getInstance().import());
    })
}

function importAndRedraw() {
    const textConfig = (d3.select("#configEditor").node() as HTMLTextAreaElement).value;
    JsonConfig.init(JSON.parse(textConfig));
    GraphState.getInstance().import();
    GraphRender.renderObjects();
}

function exportConfig() {
    GraphState.getInstance().export();
}

function initMouseEvents() {
    d3.select("#importButton").on("click", importAndRedraw);
    d3.select("#exportButton").on("click", exportConfig);
}

function initKeyboardEvents() {
    // Debug run on ctrl + enter
    window.onkeydown = function(event) {
        if (event.ctrlKey && event.keyCode === 13) {
            event.preventDefault();
            importAndRedraw();
            return;
        }
    }
}
