import Node from './objects/abstract/node';
import Position from './objects/position';
import Transition from './objects/transition';
import Arc from './objects/abstract/arc';
import { Simulation, SimulationNodeDatum, forceSimulation, forceCenter, forceManyBody } from 'd3-force';
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
}

// TODO! REFACTOR ME
export default class GraphRender {

    private simulation: Simulation<SimulationNodeDatum, never>;
    private view: Selection<SVGSVGElement, unknown, HTMLElement, never>;
    private container: Selection<SVGGElement, unknown, HTMLElement, never>;
    private state: GraphState;
    private objects: {
        positions: Selection<BaseType, Position, SVGElement, never>,
        transitions: Selection<BaseType, Transition, SVGElement, never>,
        arcs: Selection<BaseType, Arc, SVGElement, never>
    };

    protected selector: string;
    protected settings: Settings;
    protected viewSize:    Point;
    protected contentSize: Point;

    constructor(selector: string, options: GraphRenderOptions) {
        this.selector = selector;
        this.settings = mergeSettings(SETTINGS, options.settings);
        this.state = options.state;

        select("body").classed("with-debug", this.settings.debugMode);

        this.viewSize = new Point(
            Number.parseFloat(select(this.selector).style("width")),
            Number.parseFloat(select(this.selector).style("height"))
        );

        debug(this.state);

        select(this.selector).selectChildren().remove();

        this.simulation = forceSimulation().velocityDecay(0.25);
        this.view = select(this.selector).append("svg").attr("viewBox", `0 0 ${this.viewSize.x} ${this.viewSize.y}`);
        this.container = this.view.append("g").attr("class", "zoom-container");

        this.addEventListeners();
        // TODO: Create function with dynamic render support
        this.loadSvgResourses();
        this.createObjects();
        this.doAnimate();
        this.doPhysics();
    }

    private addEventListeners() {
        this.state.addEventListener(GraphStateEventType.MarkupChanged, () => this.updateMarkup());
    }

    protected createObjects(): void {

        const arcs = this.container.selectAll(".arc")
            .data(this.state.collection.arcs)
            .join((enter) => {
                const link = enter.append("g").attr("class", "link");
                link.append("path").attr("class", "arc-background").attr("id", (obj: Arc) => obj.getSerial(true));
                link.append("path")
                    .attr("class", "arc")
                    .attr("id", (obj: Arc) => obj.getSerial())
                    .attr("marker-start", (obj: Arc) => obj instanceof TwoWayArc ? "url(#marker-standart)" : null)
                    .attr("marker-end", (obj: Arc) => obj.hasInhibitory ? "url(#marker-inhibitor)" : "url(#marker-standart)");
                link.append("text").attr("class", "arc-label")
                    // .call((obj) => obj.datum().invertLabel())
                    .attr("dy", this.settings.object.arcLabelOffsetY)
                    .append("textPath")
                    .attr("href", (obj: Arc) => obj.labelInverted ? `#${obj.getSerial(true)}` : `#${obj.getSerial()}`)
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
        
        this.objects = { positions, transitions, arcs };
    }

    protected updateMarkup(): void {
        const positions = this.objects.positions;

        positions.selectChild(".position").attr("marks", (obj: Position) => obj.marks);
        positions.selectChild(".custom-marks")
            .attr("symbols", (obj: Position) => formatMarkCount(obj.marks).length)
            .text((obj: Position) => formatMarkCount(obj.marks));
    }

    protected loadSvgResourses(): void {
        const defs = this.view.append("defs");

        for (const key in resources.DEFS) {
            defs.append("svg").html(resources.DEFS[key]);
        }
    }

    protected doAnimate(): void {

        const nodesData = [...this.state.collection.positions, ...this.state.collection.transitions];
        const { positions, transitions, arcs } = this.objects;

        this.simulation.nodes(nodesData).on("tick", () => {
            arcs.each((arc: Arc) => {
                arc.updateMargins();
            });
            arcs.classed("hidden", (d: Arc) => d.shouldHide())
                .selectAll(".arc")
                .classed("hide-start", (d: Arc) => d.startSegmentReversed)
                .classed("hide-end", (d: Arc) => d.endSegmentReversed)
                .attr("d", (obj: Arc) => obj.getPath());
            arcs.selectAll(".arc-background")
                .attr("d", (obj: Arc) => obj.getPath(true));
            arcs.selectAll(".arc-label textPath")
                .text((obj: Arc) => obj.invertLabel() ? formatArcLabelText(obj) : obj.labelText)
                .attr("href", (obj: Arc) => obj.labelInverted ? `#${obj.getSerial(true)}` : `#${obj.getSerial()}`);

            positions.attr("transform", (obj: Position) => `translate(${obj.x},${obj.y})`);
            transitions.attr("transform", (obj: Transition) => `translate(${obj.x},${obj.y})`);
        });

        const zoomed = (e: D3ZoomEvent<Element, SimulationNodeDatum>) => {
            if (isNaN(e.transform.x) || isNaN(e.transform.y)) {
                return;
            }
            this.container.attr('transform', 'translate(' + e.transform.x + ',' + e.transform.y + ') scale(' + e.transform.k + ')');

            this.state.emit(GraphStateEventType.Zoomed, { 
                detail: { 
                    zoomCamera: e.transform.k,
                    translateCamera: { x: e.transform.x, y: e.transform.y },
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

        this.view.call(zoomFunc).on("wheel", e => {
            e.ctrlKey ? e.preventDefault() : null;
        }, { passive: false });
        this.cameraFitContent(zoomFunc, nodesData);
    }

    // TODO: Move to utils
    protected cameraFitContent(zoomFunc, nodesData) {

        this.viewSize = new Point(
            Number.parseFloat(select(this.selector).style("width")),
            Number.parseFloat(select(this.selector).style("height"))
        );
        
        const animation     = this.settings.animation,
              viewBoxSize   = this.viewSize,

              objCenters  = nodesData.map(node => (node.center)),
              topLeft     = objCenters.reduce((prev, current) => new Point(Math.min(prev.x, current.x), Math.min(prev.y, current.y)), objCenters[0]),
              bottomRight = objCenters.reduce((prev, current) => new Point(Math.max(prev.x, current.x), Math.max(prev.y, current.y)), objCenters[0]),
              contentSize = bottomRight.add(topLeft.getInverse()),

              [paddingX, paddingY] = [this.settings.layout.paddingX, this.settings.layout.paddingY],
              [wRatio, hRatio]     = [(viewBoxSize.x - paddingX * 2) / contentSize.x, (viewBoxSize.y - paddingY * 2) / contentSize.y],

              zoomRatio           = Math.min(wRatio, hRatio, zoomFunc.scaleExtent()[1]),
              scaledContentSize   = contentSize.multiple(zoomRatio),
              computedPadding     = new Point((viewBoxSize.x - scaledContentSize.x) / 2, (viewBoxSize.y - scaledContentSize.y) / 2),

              zoomFrom        = animation.zoomCamera >= 0 ? animation.zoomCamera : zoomRatio,
              translateFrom   = animation.translateCamera ? animation.translateCamera : null,

              targetTransform = zoomIdentity.translate(computedPadding.x, computedPadding.y).scale(zoomRatio).translate(-topLeft.x, -topLeft.y);
        

        // Camera pre-positioning
        if (animation.lockCamera || animation.moveCameraOnRedraw) {
            zoomFunc.scaleTo(this.view, zoomFrom);
            translateFrom ? zoomFunc.translateTo(this.view,
                (viewBoxSize.x / 2 - translateFrom.x) / zoomFrom,
                (viewBoxSize.y / 2 - translateFrom.y) / zoomFrom
            ) : zoomFunc.translateTo(this.view,
                contentSize.x / 2 + topLeft.x,
                contentSize.y / 2 + topLeft.y
            );
            if (!animation.lockCamera) {
                // Move camera to center (with animation)
                this.view.transition().duration(animation.moveDuration ?? 0).call(
                    zoomFunc.transform,
                    targetTransform
                );
            }
        } else {
            // Move to center (without animation)
            zoomFunc.scaleTo(this.view, zoomRatio);
            zoomFunc.translateTo(this.view,
                contentSize.x / 2 + topLeft.x,
                contentSize.y / 2 + topLeft.y,
            );
        }
    }

    protected doPhysics() {
        if (this.settings.animation.useForceCenter) {
            this.simulation.force("center", forceCenter(this.contentSize.x / 2, this.contentSize.y / 2));
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
