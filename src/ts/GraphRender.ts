import { default as ObjectInterface } from './objects/objectInterface';
import { default as Node } from './objects/node';
import { default as Position } from './objects/position';
import { default as Transition } from './objects/transition';
import { default as Arc } from './objects/arc';
import { default as Settings, DEFAULT_SETTINGS, DEBUG_PREFIX } from './settings';
import { Simulation, SimulationNodeDatum, forceSimulation, forceLink } from 'd3-force';
import { Selection, select, BaseType } from 'd3-selection';
import { drag } from 'd3-drag';
import { active } from 'd3-transition';
import GraphState, { GraphStateEventType } from './graphState';
import createDebugger from 'debug';
import complexCollide from './physics/collision';

const debug = createDebugger(DEBUG_PREFIX);

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
            ...DEFAULT_SETTINGS,
            sizes: {
                ...DEFAULT_SETTINGS.sizes,
                ...(options.settings?.sizes ?? {})
            },
            positions: {
                ...DEFAULT_SETTINGS.positions,
                ...(options.settings?.positions ?? {})
            }
        }
        this.viewCenter = { x: this.settings.sizes.viewportWidth / 2, y: this.settings.sizes.viewportHeight / 2 };
        // Remove children
        select(this.selector).selectChildren().remove();
        // Create view 
        this.view = select(this.selector)
            .append("svg")
            .attr("height", this.settings.sizes.viewportHeight)
            .attr("width", this.settings.sizes.viewportWidth);
        // Init simulation
        this.simulation = forceSimulation().velocityDecay(0.25).stop();
        // Set state
        this.state = options.state;
    }

    public render() {
        debug(this.state);
        this.createAdditional();
        this.doAnimate(this.createObjects());
        this.doPhysics();
    }

    protected createObjects(): Array<Selection<BaseType, ObjectInterface, SVGSVGElement, never>> {

        const links = this.view.selectAll(".arc")
            .data(this.state.arcs)
            .join((enter) => { 
                return enter.append("line")
                    .attr("class", "arc")
                    .attr("marker-end", "url(#marker-end)")
                    .attr("marker-end", "url(#marker-end)")
                    .attr("x1", this.viewCenter.x)
                    .attr("x2", this.viewCenter.x)
                    .attr("y1", this.viewCenter.y)
                    .attr("y2", this.viewCenter.y);
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
            }).call(drag<SVGCircleElement, never>()
                .on("start", this.dragStartedNode.bind(this))
                .on("drag", this.draggedNode.bind(this))
                .on("end", this.dragEndedNode.bind(this)));

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
            }).call(drag<SVGRectElement, never>()
                .on("start", this.dragStartedNode.bind(this))
                .on("drag", this.draggedNode.bind(this))
                .on("end", this.dragEndedNode.bind(this)));

        return [positions, transitions, links];
    }

    protected createAdditional(): void {
        this.view.append("defs").selectAll("marker")
            .data(["marker-end"])
            .enter().append("svg:marker")
                .attr("id", String)
                .attr("viewBox", "-5 -5 10 10")
                .attr("refX", 0)
                .attr("refY", 0)
                .attr("markerWidth", this.settings.sizes.sizeArrow)
                .attr("markerHeight", this.settings.sizes.sizeArrow)
                .attr("orient", "auto")
                .append("svg:path")
                    .attr("class", "arc-end")
                    .attr("d", "M-5,-5 L5,0 L-5,5");
    }

    protected doAnimate(objects: Selection<BaseType, ObjectInterface, SVGSVGElement, never>[]): void {

        const nodesData = [...this.state.positions, ...this.state.transitions];
        const [ positions, transitions, links ] = objects;
        
        // NOTE: Use `ease(d3.easePolyIn)` for beauty transitions
        positions.attr("transform", `translate(${this.viewCenter.x},${this.viewCenter.y})`)
            .transition().on("start", function start() {
                active(this).attr("transform", function(obj: Position) {
                    return `translate(${obj.x},${obj.y})`;
                });
        });
        transitions.attr("transform", `translate(${this.viewCenter.x},${this.viewCenter.y})`)
            .transition().on("start", function start() {
                active(this).attr("transform", function(obj: Transition) {
                    return `translate(${obj.x},${obj.y})`;
                });
        });
        links
            .each((link: Arc) => {
                link.calcMargins();
            })
            .transition()
            .on("start", function start() {
                active(this)
                    .attr("x1", (d: Arc) => d.start.x)
                    .attr("x2", (d: Arc) => d.end.x)
                    .attr("y1", (d: Arc) => d.start.y)
                    .attr("y2", (d: Arc) => d.end.y);
            })
            .transition()
            .on("end", () => {
                this.simulation.restart(); // First start force simulation
            });

        this.simulation.nodes(nodesData).on("tick", () => {
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

    protected doPhysics() {
        /**
         * TODO: ADD center and border force, something like:
         * this.simulation.force("center", d3.forceCenter(this.viewCenter.x, this.viewCenter.y));
         */
        this.simulation.force("link", forceLink(this.state.arcs).strength(0));
        this.simulation.force("collide", complexCollide(
            this.settings.sizes.positionRadius, [this.settings.sizes.transitionWidth, this.settings.sizes.transitionHeight])
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
