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

function initMouseEvents() {
    d3.select("#importButton").on("click", importAndRedraw);
    d3.select("#exportButton").on("click", exportConfig);
}

function initKeyboardEvents() {
    document.addEventListener('keydown', e => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            importAndRedraw();
            return;
        }
        if (e.ctrlKey && e.key === 'e') {
          e.preventDefault();
          exportConfig();
          return;
        }
    });
}

function importAndRedraw() {
    const textConfig = (d3.select("#configEditor").node() as HTMLTextAreaElement).value;
    JsonConfig.init(JSON.parse(textConfig));
    GraphState.getInstance().import();
    GraphRender.renderObjects();
}

function exportConfig() {
    const configJson = GraphState.getInstance().export();
    (d3.select("#configEditor").node() as HTMLTextAreaElement).value = configJson;

    const link = document.createElement('a');
    const file = new File([configJson], GraphState.getInstance().name + ".json", {
        type: "application/json",
    });

    link.download = file.name;
    link.href = URL.createObjectURL(file);
    link.click();
    
    URL.revokeObjectURL(link.href);
}
