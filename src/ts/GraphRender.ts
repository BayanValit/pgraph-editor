import { GraphState } from './graphState.js';

export class GraphRender {
    public static renderObjects() {
        const state = GraphState.getInstance();
        const view = d3.select("#viewport").append("svg");
        
        d3.select("#name").text(state.name);
        view.attr("height", "600").attr("width", 1200);

        state.positions.forEach(object => {
            view.append("circle") 
                .attr("cx", object.position.X)
                .attr("cy", object.position.Y)
                .attr("r", 40);
        });

        state.transitions.forEach(object => {
            view.append("rect") 
                .attr("width", object.size.width)
                .attr("height", object.size.height)
                .attr("x", object.position.X - object.size.width / 2)
                .attr("y", object.position.Y - object.size.height / 2);
        });
    }
}