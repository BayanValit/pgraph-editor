import { GraphState } from './graphState.js';
import { default as Constants } from './constants.js';

export class GraphRender {
    public static renderObjects() {
        const { ...defaults } = { ...Constants.defaultSize };
        d3.select("#viewport").selectAll("*").remove();

        const state = GraphState.getInstance();
        const view = d3.select("#viewport").append("svg");

        console.debug(state);

        d3.select("#name").text(state.name);
        view.attr("height", defaults.viewportHeight).attr("width", defaults.viewportWidth);

        state.positions.forEach(object => {
            view.append("circle") 
                .attr("cx", object.position.X)
                .attr("cy", object.position.Y)
                .attr("r", defaults.circleRadius);
        });

        state.transitions.forEach(object => {
            view.append("rect") 
                .attr("width", defaults.transitionWidth)
                .attr("height", defaults.transitionHeight)
                .attr("x", object.position.X - defaults.transitionWidth / 2)
                .attr("y", object.position.Y - defaults.transitionHeight / 2)
                .attr('transform', `rotate(${object.rotate} ${object.position.X} ${object.position.Y})`);
        });
    }
}