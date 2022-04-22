import ObjectInterface from './objects/abstract/objectInterface';
import Node from './objects/abstract/node';
import Position from './objects/position';
import Transition from './objects/transition';
import Arc from './objects/oneWayArc';
import { Simulation, SimulationNodeDatum, forceSimulation, forceLink, forceCenter, forceManyBody } from 'd3-force';
import { Selection, select, BaseType } from 'd3-selection';
import { drag } from 'd3-drag';
import { DEBUG_PREFIX, SETTINGS } from './constants';
import { mergeSettings } from './settings';
import * as resources from './resources/svg';
import GraphState, { GraphStateEventType } from './graphState';
import createDebugger from 'debug';
import formatMarkCount from './utils/formatText';
import Settings from './settings';
import TwoWayArc from './objects/twoWayArc';
import Point from './geometry/point';
import { zoom, zoomIdentity, D3ZoomEvent } from 'd3-zoom';
import { formatArcLabelText } from './utils';


const debug = createDebugger(DEBUG_PREFIX);

interface GraphRenderOptions {
    state: GraphState;
    settings?: Partial<Settings>;
    zoomStartFrom?: number;
}

// TODO! REFACTOR ME
export default class GraphRender {

    private simulation: Simulation<SimulationNodeDatum, never>;
    private view: Selection<SVGSVGElement, unknown, HTMLElement, never>;
    private container: Selection<SVGGElement, unknown, HTMLElement, never>;
    private state: GraphState;

    protected selector: string;
    protected settings: Settings;
    protected viewSize: Point;

    constructor(selector: string, options: GraphRenderOptions) {
        this.selector = selector;
        this.settings = mergeSettings(SETTINGS, options.settings);

        select("body").classed("with-debug", this.settings.debugMode);

        this.viewSize = new Point(
            Number.parseFloat(select(this.selector).style("width")),
            Number.parseFloat(select(this.selector).style("height"))
        );
        this.simulation = forceSimulation().velocityDecay(0.25);
        this.state = options.state;
    }

    public render() {
        debug(this.state);
        select(this.selector).selectChildren().remove();

        this.view = select(this.selector).append("svg").attr("viewBox", `0 0 ${this.viewSize.x} ${this.viewSize.y}`)
        this.container = this.view.append("g").attr("class", "zoom-container");

        // Render
        this.loadSvgResourses();
        this.doAnimate(this.createObjects());
        this.doPhysics();
    }

    protected createObjects(): Array<Selection<BaseType, ObjectInterface, SVGElement, never>> {

        const arcs = this.container.selectAll(".arc")
            .data(this.state.collection.arcs)
            .join((enter) => {
                const link = enter.append("g").attr("class", "link");
                link.append("path").attr("class", "arc-background");
                link.append("path")
                    .attr("class", "arc")
                    .attr("id", (obj: Arc) => obj.getSerial())
                    .attr("marker-start", (obj: Arc) => obj instanceof TwoWayArc ? "url(#marker-standart)" : null)
                    .attr("marker-end", (obj: Arc) => obj.hasInhibitory ? "url(#marker-inhibitory)" : "url(#marker-standart)");
                link.append("text").attr("class", "arc-label")
                    .attr("rotate", (obj: Arc) => obj.getVector().dx < 0 ? 180 : 0)
                    .attr("dy", this.settings.object.arcLabelOffsetY)
                    .append("textPath")
                    .attr("href", (obj: Arc) => `#${obj.getSerial()}`)
                    .attr("startOffset", "50%")
                    .text((obj: Arc) => formatArcLabelText(obj));
                return link;
            });

        const positions = this.container.selectAll(".position")
            .data(this.state.collection.positions)
            .join((enter) => {
                const node = enter.append("g").attr("class", "node");
                node.append("circle")
                    .attr("class", "position")
                    .attr("r", (obj: Position) => obj.radius)
                    .attr("marks", (obj: Position) => obj.marks);
                node.append("text")
                    .attr("class", "label")
                    .attr("dy", this.settings.object.positionLabelOffsetY)
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

        const transitions = this.container.selectAll(".transition")
            .data(this.state.collection.transitions)
            .join((enter) => {
                const node = enter.append("g").attr("class", "node");
                
                node.append("rect")
                    .attr("class", "transition")
                    .attr("width", (obj: Transition) => obj.width)
                    .attr("height", (obj: Transition) => obj.height)
                    .attr("ry", this.settings.object.positionBorderRadius)
                    .attr("rx", this.settings.object.positionBorderRadius)
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
        
        return [positions, transitions, arcs];
    }

    protected loadSvgResourses(): void {
        const defs = this.view.append("defs");

        for (const key in resources.DEFS) {
            defs.append("svg").html(resources.DEFS[key]);
        }
    }

    protected doAnimate(objects: Selection<BaseType, ObjectInterface, SVGElement, never>[]): void {

        const nodesData = [...this.state.collection.positions, ...this.state.collection.transitions];
        const [positions, transitions, arcs] = objects;

        this.simulation.nodes(nodesData).on("tick", () => {
            arcs.each((arc: Arc) => {
                arc.updateMargins();
            });
            arcs.classed("hide-start", (d: Arc) => d.startReversed)
                .classed("hide-end", (d: Arc) => d.endReversed)
                .classed("hidden", (d: Arc) => d.hidden)
                .selectAll(".arc, .arc-background")
                .attr("d", (obj: Arc) => obj.getPath());
            arcs.selectAll(".arc-label")
                .attr("rotate", (obj: Arc) => obj.getVector().dx < 0 ? 180 : 0);

            positions.attr("transform", (obj: Transition) => `translate(${obj.x},${obj.y})`);
            transitions.attr("transform", (obj: Position) => `translate(${obj.x},${obj.y})`);
        });

        const zoomed = (e: D3ZoomEvent<Element, SimulationNodeDatum>) => {
            this.container.attr('transform', 'translate(' + e.transform.x + ',' + e.transform.y + ') scale(' + e.transform.k + ')');
            console.log('emit', new Point(e.transform.x, e.transform.y), e.transform.k)

            this.state.emit(GraphStateEventType.Zoomed, { 
                detail: { 
                    zoomRatio: e.transform.k,
                    translateStartFrom: new Point(e.transform.x, e.transform.y),
                }
            });
        }

        // Current Behavior:
        // LMB = panning and move
        // Ctrl + whell = zoom
        const zoomFunc = zoom().scaleExtent([0, 1])
            .filter((e) => ((e.ctrlKey && e.type === 'wheel') || e.button === 0 && e.type === 'mousedown'))
            .wheelDelta((e) => -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002))
            .on('zoom', zoomed);

        this.zoomOnStart(nodesData, zoomFunc);
        this.view.call(zoomFunc).on("wheel", event => event.preventDefault());
    }

    protected zoomOnStart(nodesData: Node[], zoomFunc) {

        const animation   = this.settings.animation;
        const centers     = nodesData.map(node => (node.center));
        const topLeft     = centers.reduce((prev, current) => new Point(Math.min(prev.x, current.x), Math.min(prev.y, current.y)), centers[0]);
        const bottomRight = centers.reduce((prev, current) => new Point(Math.max(prev.x, current.x), Math.max(prev.y, current.y)), centers[0]);

        const viewBoxSize = new Point(this.viewSize.x, this.viewSize.y);
        const containerSize = bottomRight.add(topLeft.getInverse());
        const [paddingX, paddingY] = [this.settings.layout.paddingX, this.settings.layout.paddingY];
        
        const [wRatio, hRatio] = [(viewBoxSize.x - paddingX * 2) / containerSize.x, (viewBoxSize.y - paddingY * 2) / containerSize.y];

        const zoomRatio = Math.min(wRatio, hRatio, zoomFunc.scaleExtent()[1]);
        const newContainerSize = containerSize.multiple(zoomRatio);
        const computePadding = new Point((viewBoxSize.x - newContainerSize.x) / 2, (viewBoxSize.y - newContainerSize.y) / 2);

        console.log({
            viewBoxSize: [viewBoxSize.x, viewBoxSize.y],
            containerSize: [containerSize.x, containerSize.y],
            newContainerSize: [containerSize.x * zoomRatio, containerSize.y * zoomRatio],
            padding: [paddingX, paddingY],
            zoomRatio: zoomRatio,
            computePadding: computePadding,
            translateStartFrom: animation.translateStartFrom,
            transform_view: this.view.attr("transform"),
            transform_container: this.container.attr("transform"),
        })

        const initTransform = zoomIdentity.translate(computePadding.x, computePadding.y).scale(zoomRatio);
        const zoomParam = animation.useStartZoom && animation.zoomStartFrom >= 0 ? animation.zoomStartFrom : zoomRatio;
        const translateParam = animation.useStartTranslate && animation.translateStartFrom?.get() ? animation.translateStartFrom : computePadding;

        // TODO

        zoomFunc.scaleTo(this.view, zoomParam);
        zoomFunc.translateTo(this.view, containerSize.x / 2, containerSize.y / 2);

        if (animation.useStartZoom || animation.useStartTranslate) {
            this.view.transition().duration(animation.startDuration).call(
                zoomFunc.transform,
                initTransform
            );
        }
    }

    protected doPhysics() {
        if (this.settings.animation.useForceCenter) {
            this.simulation.force("center", forceCenter(this.viewSize.x / 2, this.viewSize.y / 2));
        }
        if (this.settings.animation.useForceCharge) {
            this.simulation.force("charge", forceManyBody().distanceMax(this.settings.animation.forceChargeMaxDistance).strength(-1000));
        }
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
