import { JsonConfig } from './JsonConfig.js';
import { GraphRender } from './GraphRender.js';

window.onload = function () {
    init().then(() => GraphRender.renderObjects());
};

function init() {
    return fetch('../src/examples/data.example.json').then(response => response.json()).then(
        json => JsonConfig.init(json)
    );
}
