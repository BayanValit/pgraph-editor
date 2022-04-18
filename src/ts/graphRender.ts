import ObjectInterface from './objects/abstract/objectInterface';
import Node from './objects/abstract/node';
import Position from './objects/position';
import Transition from './objects/transition';
import Arc from './objects/oneWayArc';
import { Simulation, SimulationNodeDatum, forceSimulation, forceLink } from 'd3-force';
import { Selection, select, BaseType } from 'd3-selection';
import { drag } from 'd3-drag';
import { active } from 'd3-transition';
import GraphState, { GraphStateEventType } from './graphState';
import createDebugger from 'debug';
import complexCollide from './physics/collision';
import formatMarkCount from './utils/formatText';
import Settings from './settings';
import * as resources from './resources/svg';
import * as constants from './constants';
import TwoWayArc from './objects/twoWayArc';

const debug = createDebugger(constants.DEBUG_PREFIX);

interface GraphRenderOptions {
    settings?: Partial<Settings>;
    state: GraphState;
}

export default class GraphRender {

    private simulation: Simulation<SimulationNodeDatum, never>;
    private view: Selection<SVGSVGElement, unknown, HTMLElement, never>;
    private state: GraphState;

    protected selector: string;
    protected settings: Settings;
    protected viewCenter: {
        x: number,
        y: number,
    }

    constructor(selector: string, options: GraphRenderOptions) {
        this.selector = selector;
        this.settings = {
            ...constants.DEFAULT_SETTINGS,
            ...options.settings,
            object: {
                ...constants.DEFAULT_SETTINGS.object,
                ...(options.settings?.object ?? {})
            },
            layout: {
                ...constants.DEFAULT_SETTINGS.layout,
                ...(options.settings?.layout ?? {})
            },
        }
        this.viewCenter = { x: this.settings.layout.viewportWidth / 2, y: this.settings.layout.viewportHeight / 2 };
        // Init simulation
        this.simulation = forceSimulation().velocityDecay(0.25).stop();
        // Set state
        this.state = options.state;
    }

    public render() {
        debug(this.state);
        // Remove old objects
        select(this.selector).selectChildren().remove();
        // Create view 
        this.view = select(this.selector)
            .append("svg")
            .attr("height", this.settings.layout.viewportHeight)
            .attr("width", this.settings.layout.viewportWidth);
        // Render
        this.loadSvgResourses();
        this.doAnimate(this.createObjects());
        this.doPhysics();
    }

    protected createObjects(): Array<Selection<BaseType, ObjectInterface, SVGSVGElement, never>> {

        const links = this.view.selectAll(".arc")
            .data(this.state.collection.arcs)
            .join((enter) => {
                const line = enter.append("path")
                    .attr('d', (obj: Arc) => obj.getPath())
                    .attr("class", "arc")
                    .attr("marker-start", (obj: Arc) => obj instanceof TwoWayArc ? "url(#marker-standart)" : null)
                    .attr("marker-end", (obj: Arc) => obj.hasInhibitory ? "url(#marker-inhibitory)" : "url(#marker-standart)");
                if (this.settings.animation.useStart) {
                    line.attr('d', (obj: Arc) => obj.getPath());
                }
                return line;
            });
        const positions = this.view.selectAll(".position")
            .data(this.state.collection.positions)
            .join((enter) => {
                const node = enter.append("g").attr("class", "node");
                if (!this.settings.animation.useStart) {
                    node.attr("transform", (obj: Position) => `translate(${obj.x},${obj.y})`);
                }
                node.append("circle")
                    .attr("class", "position")
                    .attr("r", (obj: Position) => obj.radius)
                    .attr("marks", (obj: Position) => obj.marks);
                node.append("text")
                    .attr("class", "label")
                    .attr("dy", "-2em")
                    .text((_obj: never, key: number) => "P" + (key + 1));
                node.append("text")
                    .attr("class", "custom-marks")
                    .attr("dy", ".33em")
                    .attr("symbols", (obj: Position) => formatMarkCount(obj.marks).length)
                    .text((obj: Position) => formatMarkCount(obj.marks));
                return node;
            }).call(drag<SVGCircleElement, never>()
                .on("start", this.dragStartedNode.bind(this))
                .on("drag", this.draggedNode.bind(this))
                .on("end", this.dragEndedNode.bind(this)));

        const transitions = this.view.selectAll(".transition")
            .data(this.state.collection.transitions)
            .join((enter) => {
                const node = enter.append("g").attr("class", "node");
                if (!this.settings.animation.useStart) {
                    node.attr("transform", (obj: Transition) => `translate(${obj.x},${obj.y})`);
                }
                node.append("rect")
                    .attr("class", "transition")
                    .attr("width", (obj: Transition) => obj.width)
                    .attr("height", (obj: Transition) => obj.height)
                    .attr("transform", (obj: Transition) => `rotate(${obj.rotateAngle} 0 0) 
                        translate(${- obj.width / 2},${- obj.height / 2})`);
                node.append("text")
                    .attr("class", "label")
                    .attr("dy", ".33em")
                    .text((_obj: never, key: number) => "T" + (key + 1));
                return node;
            }).call(drag<SVGRectElement, never>()
                .on("start", this.dragStartedNode.bind(this))
                .on("drag", this.draggedNode.bind(this))
                .on("end", this.dragEndedNode.bind(this)));
        if (!this.settings.animation.useStart) {
            links.each((link: Arc) => {
                link.updateMargins();
            })
            .attr('d', (obj: Arc) => obj.getPath())
            .classed("hide-start", (d: Arc) => d.startReversed)
            .classed("hide-end", (d: Arc) => d.endReversed)
            .classed("hidden", (d: Arc) => d.hidden);
        }
        
        return [positions, transitions, links];
    }

    protected loadSvgResourses(): void {
        const defs = this.view.append("defs");

        for (const key in resources.DEFS) {
            defs.append("svg").html(resources.DEFS[key]);
        }
    }

    protected doAnimate(objects: Selection<BaseType, ObjectInterface, SVGSVGElement, never>[]): void {

        const nodesData = [...this.state.collection.positions, ...this.state.collection.transitions];
        const [positions, transitions, links] = objects;

        // NOTE: Use `ease(d3.easePolyIn)` for beauty transitions
        if (this.settings.animation.useStart) {
            positions
                .attr("transform", `translate(${this.viewCenter.x},${this.viewCenter.y})`)
                .transition()
                .on("start", function start() {
                    active(this).attr("transform", function (obj: Position) {
                        return `translate(${obj.x},${obj.y})`;
                    });
                });
            transitions
                .attr("transform", `translate(${this.viewCenter.x},${this.viewCenter.y})`)
                .transition()
                .on("start", function start() {
                    active(this).attr("transform", function (obj: Transition) {
                        return `translate(${obj.x},${obj.y})`;
                    });
                });
    
            links
                .each((link: Arc) => {
                    link.updateMargins();
                })
                .classed("hide-start", (d: Arc) => d.startReversed)
                .classed("hide-end", (d: Arc) => d.endReversed)
                .classed("hidden", (d: Arc) => d.hidden)
                .transition()
                .on("start", function start() {
                    active(this)
                        .attr('d', (obj: Arc) => obj.getPath());

                })
                .transition()
                .on("end", () => {
                    this.simulation.restart(); // First start force simulation
                });
        }


        this.simulation.nodes(nodesData).on("tick", () => {
            links.each((link: Arc) => {
                link.updateMargins();
            });

            links.attr('d', (obj: Arc) => obj.getPath())
                .classed("hide-start", (d: Arc) => d.startReversed)
                .classed("hide-end", (d: Arc) => d.endReversed)
                .classed("hidden", (d: Arc) => d.hidden);

            positions.attr("transform", (obj: Transition) => `translate(${obj.x},${obj.y})`);
            transitions.attr("transform", (obj: Position) => `translate(${obj.x},${obj.y})`);
        });
    }

    protected doPhysics() {
        /**
         * TODO: ADD center and border force, something like:
         * this.simulation.force("center", d3.forceCenter(this.viewCenter.x, this.viewCenter.y));
         */
        this.simulation.force("link", forceLink(this.state.collection.arcs).strength(0));
        this.simulation.force("collide", complexCollide(
            this.settings.object.positionRadius, [this.settings.object.transitionWidth, this.settings.object.transitionHeight])
        );
        // this.simulation.force("charge", d3.forceManyBody().distanceMin(100).strength(500));
    }

    protected dragStartedNode(event: { active: number; }, d: Node): void {
        if (!event.active) {
            this.simulation.alphaTarget(.03).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
    }

    protected draggedNode(event, d: Node): void {
        d.fx = event.x;
        d.fy = event.y;

        d.vy += event.dy;
        d.vx += event.dx;
    }

    protected dragEndedNode(event, d: Node): void {
        if (!event.active) {
            this.simulation.alphaTarget(.03);
        }
        d.fx = null;
        d.fy = null;
        // TODO: emit node which has changed
        this.state.emit(GraphStateEventType.Changed);
    }
}
