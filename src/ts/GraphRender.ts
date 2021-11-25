import { GraphState } from './graphState.js';
import { default as Constants } from './constants.js';

export class GraphRender {
    public static renderObjects() {
        const { ...defaults } = { ...Constants.defaultSizes };
        d3.select("#viewport").selectAll("*").remove();

        const state = GraphState.getInstance();
        const view = d3.select("#viewport").append("svg");

        console.debug(state);

        d3.select("#name").text(state.name);
        view.attr("height", defaults.viewportHeight).attr("width", defaults.viewportWidth);
       
        const simulation = d3.forceSimulation();

        // build the arrow.
        view.append("svg:defs").selectAll("marker")
            .data(["end"])
            .enter().append("svg:marker")
                .attr("id", String)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15)
                .attr("refY", -1.5)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
                .append("svg:path")
                    .attr("d", "M0,-5L10,0L0,5");

        const links = view.selectAll(".arc")
            .data(state.arcs)
            .join((enter) => enter.append("line").attr("class", "arc").attr("marker-end", "url(#end)"));

        // Nodes data
        const positions = view.selectAll(".position")
            .data(state.positions)
            .join((enter) => {
                const node = enter.append("g").attr("class", "node");
                node.append("circle")
                    .attr("class", "position")
                    .attr("r", defaults.positionRadius);
                node.append("text")
                    .attr("class", "label")
                    .attr("dy", ".4em")
                    .text((_obj, key) => 'P' + (key + 1));
                return node;
            }).call(d3.drag<SVGCircleElement, any>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        const transitions = view.selectAll(".transition")
            .data(state.transitions)
            .join((enter) => {
                const node = enter.append("g").attr("class", "node");
                node.append("rect")
                    .attr("class", "transition")
                    .attr("width", defaults.transitionWidth)
                    .attr("height", defaults.transitionHeight)
                    .attr("transform", (obj) => `rotate(${obj.rotate} ${defaults.transitionWidth / 2} ${defaults.transitionHeight / 2})`);
                node.append("text")
                    .attr("class", "label")
                    .attr("x", defaults.transitionWidth / 2)
                    .attr("y", defaults.transitionHeight / 2)
                    .attr("dy", ".35em")
                    .text((_obj, key) => 'T' + (key + 1));
                return node;
            }).call(d3.drag<SVGRectElement, any>()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        simulation.nodes([...state.positions, ...state.transitions]).on("tick", () => {
            links
            .attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);

            positions.attr("transform", function(obj) { 
                return "translate(" + obj.x + "," + obj.y + ")";
            });

            transitions.attr("transform", function(obj) { 
                return "translate(" + (obj.x - defaults.transitionWidth / 2) + "," + (obj.y - defaults.transitionHeight / 2) + ")";
            });
        });

        function dragstarted(event, d) {
            if (!event.active) {
                simulation.alphaTarget(.03).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
        }
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }
        function dragended(event, d) {
        if (!event.active) {
            simulation.alphaTarget(.03);
        }    
            d.fx = null;
            d.fy = null;
        }
    }
}