import * as d3 from 'd3';
import GraphState from './GraphState';
import { ObjectInterface } from './objects/object';
import { Node } from './objects/node';
import { Position } from './objects/position';
import { Transition } from './objects/transition';
import { Arc } from './objects/arc';

import Settings from './settings';
import complexCollide from './physics/collision';

export default class GraphRender {

    private static simulation: d3.Simulation<d3.SimulationNodeDatum, never>;
    private static view: d3.Selection<SVGSVGElement, unknown, HTMLElement, never>;
    private static state: GraphState;

    protected static defaults = { ...Settings.defaultSizes };
    protected static viewCenter = { X: this.defaults.viewportWidth / 2, Y: this.defaults.viewportHeight / 2 };

    public static renderObjects() {

        this.state = GraphState.getInstance();

        if (Settings.debugMode) {
            d3.select("#debugPanel").style("display", "flex");
            console.debug(this.state);
        }

        d3.select("#viewport").selectChildren().remove();
        d3.select("#name").text(this.state.name);

        this.simulation = d3.forceSimulation().velocityDecay(0.25).stop();
        this.view = d3.select("#viewport")
            .append("svg")
            .attr("height", this.defaults.viewportHeight)
            .attr("width", this.defaults.viewportWidth);

        this.createAdditional();
        this.doAnimate(this.createObjects());
        this.doPhysics();
    }

    protected static createObjects(): Array<d3.Selection<d3.BaseType, ObjectInterface, SVGSVGElement, never>> {

        const links = this.view.selectAll(".arc")
            .data(this.state.arcs)
            .join((enter) => { 
                return enter.append("line")
                    .attr("class", "arc")
                    .attr("marker-end", "url(#marker-end)")
                    .attr("marker-end", "url(#marker-end)")
                    .attr("x1", this.viewCenter.X)
                    .attr("x2", this.viewCenter.X)
                    .attr("y1", this.viewCenter.Y)
                    .attr("y2", this.viewCenter.Y);
            });

        const positions = this.view.selectAll(".position")
            .data(this.state.positions)
            .join((enter) => {
                const node = enter.append("g").attr("class", "node");
                node.append("circle")
                    .attr("class", "position")
                    .attr("r", (obj: Position) => obj.radius);
                node.append("text")
                    .attr("class", "label")
                    .attr("dy", ".4em")
                    .text((_obj: never, key: number) => "P" + (key + 1));
                return node;
            }).call(d3.drag<SVGCircleElement, never>()
                .on("start", this.dragstartedNode)
                .on("drag", this.draggedNode)
                .on("end", this.dragendedNode));

        const transitions = this.view.selectAll(".transition")
            .data(this.state.transitions)
            .join((enter) => {
                const node = enter.append("g").attr("class", "node");
                node.append("rect")
                    .attr("class", "transition")
                    .attr("width", (obj: Transition) => obj.width)
                    .attr("height", (obj: Transition) => obj.height)
                    .attr("transform", (obj: Transition) => `rotate(${obj.rotateAngle} 0 0) 
                        translate(${- obj.width / 2},${- obj.height / 2})`);
                node.append("text")
                    .attr("class", "label")
                    .attr("dy", ".35em")
                    .text((_obj: never, key: number) => "T" + (key + 1));
                return node;
            }).call(d3.drag<SVGRectElement, never>()
                .on("start", this.dragstartedNode)
                .on("drag", this.draggedNode)
                .on("end", this.dragendedNode));

        return [positions, transitions, links];
    }

    protected static createAdditional(): void {
        this.view.append("defs").selectAll("marker")
            .data(["marker-end"])
            .enter().append("svg:marker")
                .attr("id", String)
                .attr("viewBox", "-5 -5 10 10")
                .attr("refX", 0)
                .attr("refY", 0)
                .attr("markerWidth", this.defaults.sizeArrow)
                .attr("markerHeight", this.defaults.sizeArrow)
                .attr("orient", "auto")
                .append("svg:path")
                    .attr("class", "arc-end")
                    .attr("d", "M-5,-5 L5,0 L-5,5");
    }

    protected static doAnimate(objects: d3.Selection<d3.BaseType, ObjectInterface, SVGSVGElement, never>[]): void {

        const nodesData = [...this.state.positions, ...this.state.transitions];
        const [ positions, transitions, links ] = [...objects];
        
        // NOTE: Use `ease(d3.easePolyIn)` for beauty transitions
        positions.attr("transform", `translate(${this.viewCenter.X},${this.viewCenter.Y})`)
            .transition().on("start", function start() {
                d3.active(this).attr("transform", function(obj: Position) {
                    return `translate(${obj.x},${obj.y})`;
                });
        });
        transitions.attr("transform", `translate(${this.viewCenter.X},${this.viewCenter.Y})`)
            .transition().on("start", function start() {
                d3.active(this).attr("transform", function(obj: Transition) {
                    return `translate(${obj.x},${obj.y})`;
                });
        });
        links.each((link: Arc) => {
            link.calcMargins();
        }).transition().on("start", function start() {
            d3.active(this)
                .attr("x1", (d: Arc) => d.start.x)
                .attr("x2", (d: Arc) => d.end.x)
                .attr("y1", (d: Arc) => d.start.y)
                .attr("y2", (d: Arc) => d.end.y);
        }).transition().on("end", function end() {
            GraphRender.simulation.restart(); // First start force simulation
        });

        GraphRender.simulation.nodes(nodesData).on("tick", () => {
            links.each((link: Arc) => {
                link.calcMargins();
            });
            
            links
                .attr("x1", (d: Arc) => d.start.x)
                .attr("x2", (d: Arc) => d.end.x)
                .attr("y1", (d: Arc) => d.start.y)
                .attr("y2", (d: Arc) => d.end.y);

            positions.attr("transform", (obj: Transition) => `translate(${obj.x},${obj.y})`);
            transitions.attr("transform", (obj: Position) => `translate(${obj.x},${obj.y})`);
        });
    }

    protected static doPhysics() {
        /**
         * TODO: ADD center and border force, something like:
         * GraphRender.simulation.force("center", d3.forceCenter(this.viewCenter.X, this.viewCenter.Y));
         */
        GraphRender.simulation.force("link", d3.forceLink(this.state.arcs).strength(0));
        GraphRender.simulation.force("collide", complexCollide(
            this.defaults.positionRadius, [this.defaults.transitionWidth, this.defaults.transitionHeight])
        );
        // GraphRender.simulation.force("charge", d3.forceManyBody().distanceMin(100).strength(500));
    }

    protected static dragstartedNode(event: { active: number; }, d: Node): void {
        if (!event.active) {
            GraphRender.simulation.alphaTarget(.03).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
    }

    protected static draggedNode(event, d: Node): void {
        d.fx = event.x;
        d.fy = event.y;

        d.vy += event.dy;
        d.vx += event.dx;
    }

    protected static dragendedNode(event, d: Node): void {
        if (!event.active) {
            GraphRender.simulation.alphaTarget(.03);
        }
        d.fx = null;
        d.fy = null;
    }
}
