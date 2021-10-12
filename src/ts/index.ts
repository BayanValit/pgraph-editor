import { graphBase } from './graphBase.js';

window.onload = function () {
    init().then(response => {
        const base = new graphBase(response);
        // base.getRequired();
        console.log('1');

    });
};

function init() {
    let line = '0';
    return fetch('../src/data.json').then(response => response.json()).then(
        jsonResponse => {
            let matrixFP = jsonResponse['nets'][line]['matrixFP'];
            let matrixFT = jsonResponse['nets'][line]['matrixFT'];
            let markup   = jsonResponse['nets'][line]['markup'];
            return {'FP': matrixFP, 'FT': matrixFT, 'markup': markup};
    });
}
