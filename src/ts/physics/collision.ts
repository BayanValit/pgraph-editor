import { Point } from "../objects/point.js";
import { Position } from "../objects/position.js";
import { Transition } from "../objects/transition.js";
import { Node } from "../objects/node.js";
import { Quadtree } from "d3-quadtree";
import { PolygonVector } from "./polygonVector.js";
import { Vector } from "../objects/vector.js";

// TODO: terrible collisions ↓↓↓
export default function (radius, size) {
  let nodes: Node[],
      sizes,
      velocities,
      rotates,
      radii,
      random,
      strength = 1,
      iterations = 1;

  if (typeof radius !== "function") {
    radius = constant(radius == null ? 1 : +radius);
  }

  if (typeof size !== "function") {
    size = constant(size == null ? [0, 0] : size);
  }

  function force() {
    const nlength = nodes.length;
    let i,
        tree: Quadtree<[number, number]>,
        node: Node,
        xi,
        yi,
        ri,
        rotate,
        velocity,
        size;

    for (let k = 0; k < iterations; ++k) {
      tree = d3.quadtree(nodes, xCenter, yCenter).visitAfter(prepare);
      for (i = 0; i < nlength; ++i) {
        node = nodes[i];
        xi = node.x + node.vx;
        yi = node.y + node.vy;
        ri = radii[node.index];
        rotate = rotates[node.index];
        velocity = velocities[node.index];
        size = sizes[node.index];
        tree.visit(apply);
      }
    }

    function apply(quad, x0, y0, x1, y1) {
      const data: Node = quad.data;
      
      const rj = quad.r;
      const r = ri + rj;
      
      if (data && data.index > node.index) {
        let x = xi - data.x - data.vx;
        let y = yi - data.y - data.vy;
        let l = x * x + y * y;

        if (node.type == Position) {
          if (data.type == Position) {
              if (l < r * r) {
                if (x === 0) x = jiggle(random), l += x * x;
                if (y === 0) y = jiggle(random), l += y * y;
                l = (r - (l = Math.sqrt(l))) / l * strength;
                const v = velocity / velocities[data.index];

                node.vx += (x *= l) / v;
                node.vy += (y *= l) / v;
    
                data.vx -= x * v;
                data.vy -= y * v;
              }
              return;
          }
          if (data.type == Transition) {
            const xSemiSize = quad.size[0] / 2;
            const ySemiSize = quad.size[1] / 2;
            
            if (Math.abs(x) > xSemiSize + ri || Math.abs(y) > ySemiSize + ri) {
              return;
            }
            const r2 = Math.sqrt(xSemiSize ** 2 + ySemiSize ** 2) + ri;
            if (l < r2 ** 2) {
              const v = velocity / velocities[data.index];
              const deb = (((x ** 2 / (ri + xSemiSize) ** 2)) + ((y ** 2 / (ri + ySemiSize) ** 2))) * (20 / strength);
              console.log(deb);

              if (x === 0) x = jiggle(random), x *= x;
              if (y === 0) y = jiggle(random), y *= y;

              node.vx += (x / deb) / v;
              node.vy += (y / deb) / v;

              data.vx -= x / deb * v;
              data.vy -= y / deb * v;
            }
            return;
          }
        }

        if (node.type == Transition && data.type == Transition) {

          const xSemiSize = quad.size[0] / 2;
          const ySemiSize = quad.size[1] / 2;

          const cpoints: Point[] = [
            new Point({ x: xi - xSemiSize, y: yi - ySemiSize }),
            new Point({ x: xi + xSemiSize, y: yi - ySemiSize }),
            new Point({ x: xi + xSemiSize, y: yi + ySemiSize }),
            new Point({ x: xi - xSemiSize, y: yi + ySemiSize })
          ]

          const dpoints: Point[] = [
            new Point({ x: data.x - xSemiSize, y: data.y - ySemiSize }),
            new Point({ x: data.x + xSemiSize, y: data.y - ySemiSize }),
            new Point({ x: data.x + xSemiSize, y: data.y + ySemiSize }),
            new Point({ x: data.x - xSemiSize, y: data.y + ySemiSize })
          ]


          const ctpoints: Point[] = cpoints.map(function (point) {
            return rotateTransform(point, new Point({ x: xi, y: yi }), Math.PI * rotate / 180);
          });

          const dtpoints: Point[] = dpoints.map(function (point) {
            return rotateTransform(point, new Point({ x: data.x, y: data.y }), Math.PI * rotates[data.index] / 180);
          });


          const collision = PolygonsCollision(ctpoints, dtpoints);

          if (collision) {
              const repulsiveForce =  1 / (collision.calcDiscrepancy() / 100000);


              const v = velocity / velocities[data.index];

              // const minX = ctpoints.reduce(function (prev, current) {
              //    return current.x < prev.x ? current : prev
              // }).x;
              // const minY = ctpoints.reduce(function (prev, current) {
              //   return current.y < prev.y ? current : prev
              // }).y;
              // const maxX = ctpoints.reduce(function (prev, current) {
              //   return current.x > prev.x ? current : prev
              // }).x;
              // const maxY = ctpoints.reduce(function (prev, current) {
              //   return current.y > prev.y ? current : prev
              // }).y;

              // const minDX = dtpoints.reduce(function (prev, current) {
              //   return current.x < prev.x ? current : prev
              // }).x;
              // const minDY = dtpoints.reduce(function (prev, current) {
              //   return current.y < prev.y ? current : prev
              // }).y;
              // const maxDX = dtpoints.reduce(function (prev, current) {
              //   return current.x > prev.x ? current : prev
              // }).x;
              // const maxDY = dtpoints.reduce(function (prev, current) {
              //   return current.y > prev.y ? current : prev
              // }).y;

              // const xCrit = ((maxX - minX) + (maxDX - minDX)) / 2; 
              // const yCrit = ((maxY - minY) + (maxDY - minDY)) / 2;

              const xRectDist = (size[0] + quad.size[0]) / 2;
              const yRectDist = (size[1] + quad.size[1]) / 2;
              // const xRectDist = (size[0] + quad.size[0]) / 2;
              // const yRectDist = (size[1] + quad.size[1]) / 2;

              const xd = Math.abs(x) - xRectDist;
              const yd = Math.abs(y) - yRectDist;
              // node.vx -= (x *= xd / Math.sqrt(l) * strength) * v * Math.sin(Math.PI * rotate / 180)
              // data.vx += x * (1 - v) * Math.cos(Math.PI * rotates[data.index] / 180)
              // const newXd = Math.abs(x) - xCrit;
              // const newYd = Math.abs(y) - yCrit;


              const nodeSide = collision.calcSide(0);
              const dataSide = collision.calcSide(1);

              const cv = Vector.fromPoints(ctpoints[(nodeSide + 0) % ctpoints.length], ctpoints[(nodeSide + dtpoints.length - 1) % ctpoints.length])
                .getUnitVector();

              const dv = Vector.fromPoints(dtpoints[(dataSide + 0) % dtpoints.length], dtpoints[(dataSide + dtpoints.length - 1) % dtpoints.length])
                .getUnitVector();

              // console.log(cv, dv, nodeSide, dataSide);

              node.vx += repulsiveForce / v * cv.x * strength
              node.vy += repulsiveForce / v * cv.y * strength
              data.vx += repulsiveForce * v * dv.x * strength
              data.vy += repulsiveForce * v * dv.y * strength
            
            } 
          return;
        }
        const xRectDist = (size[0] + quad.size[0]) / 2;
        const yRectDist = (size[1] + quad.size[1]) / 2;
        return node.type == Position ? x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r 
          : node.type == Transition ? x0 > xi + xRectDist || y0 > yi + yRectDist || x1 < xi - xRectDist || y1 < yi - yRectDist : false;
      }
    }
  }

  /**
   * @param a an array of connected points (clockwise) [{x:, y:}, {x:, y:},...] that form a closed polygon
   * @param b an array of connected points (clockwise) [{x:, y:}, {x:, y:},...] that form a closed polygon
   * @return PolygonVector object if there is any intersection between the 2 polygons, false otherwise
   */
  function PolygonsCollision(a, b): PolygonVector | false {
    const polygons = [a, b];
    const min: number[] = [], max: number[] = [];
    let projected: number;

    const result = new PolygonVector(a, b);

    for (let indexPolygon = 0; indexPolygon < polygons.length; indexPolygon++) {
        const polygon = polygons[indexPolygon];
        const nextIndexPolygon = (indexPolygon + 1) % 2;
        
        for (let indexEdge = 0; indexEdge < polygon.length; indexEdge++) {

            const p1 = polygon[indexEdge];
            const p2 = polygon[(indexEdge + 1) % polygon.length];

            const normal = { x: p2.y - p1.y, y: p1.x - p2.x };
            
            for (let index = 0; index < polygons.length; index++) {
              min[index] = Infinity, max[index] = -Infinity;

              for (let j = 0; j < polygons[index].length; j++) {
                projected = normal.x * polygons[index][j].x + normal.y * polygons[index][j].y;

                if (projected < min[index]) {
                  min[index] = projected;
                }
                if (projected > max[index]) {
                  max[index] = projected;
                }
              }
            }
            
            if (max[indexPolygon] < min[nextIndexPolygon] || max[nextIndexPolygon] < min[nextIndexPolygon]) {
              return false;
            }
            result.vectors[indexPolygon][indexEdge] = new Vector({ x: max[nextIndexPolygon] - min[indexPolygon], y: max[indexPolygon] - min[nextIndexPolygon] });
        }
    }
    result.isCollide = true;
    return result;
  }

  function rotateTransform(
    point: Point,
    centerPoint: Point,
    alpha: number
  ): Point {
    const X = (point.x - centerPoint.x) * Math.cos(alpha) - (point.y - centerPoint.y) * Math.sin(alpha) + centerPoint.x;
    const Y = (point.x - centerPoint.x) * Math.sin(alpha) + (point.y - centerPoint.y) * Math.cos(alpha) + centerPoint.y;

    return new Point({x: X, y: Y});
  }

  function prepare(quad) {
    if (quad.data) {
      quad.size = sizes[quad.data.index];
      quad.r = radii[quad.data.index];
    } else {
      quad.size = [0, 0]
      for (let i = quad.r = 0; i < 4; ++i) {
        if (quad[i] && quad[i].size) {
          quad.size[0] = Math.max(quad.size[0], quad[i].size[0])
          quad.size[1] = Math.max(quad.size[1], quad[i].size[1])
        }
        if (quad[i] && quad[i].r > quad.r) {
          quad.r = quad[i].r;
        }
      }
    }
  }

  function xCenter(d) {
    return d.x + d.vx;
  }
  
  function yCenter(d) {
    return d.y + d.vy;
  }

  function initialize() {
    if (!nodes) {
      return;
    }
    const nlength = nodes.length;

    radii = new Array(nlength);
    sizes = new Array(nlength);
    velocities = new Array(nlength);
    rotates = new Array(nlength);
    let node: Node;
    for (let i = 0; i < nlength; ++i) {
      node = nodes[i],
      radii[i] = +radius(node, i, nodes) ?? 0,
      sizes[i] = size(node, i, nodes) ?? [0,0],
      rotates[i] = node.type == Transition ? (node as Transition).rotate : null,
      velocities[i] = node.type == Position ? radii[i] ** 2 * Math.PI : sizes[i][0] * sizes[i][1];
    }
  }

  force.initialize = function(_nodes: Node[], _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };

  force.iterations = function(_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };

  force.strength = function(_) {
    return arguments.length ? (strength = +_, force) : strength;
  };

  force.radius = function(_) {
    return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), initialize(), force) : radius;
  };

  force.size = function (_) {
    return (arguments.length ? (size = typeof _ === "function" ? _ : constant(_), force) : size);
  }
  return force;
}

function constant(x) {
    return function () {
        return x
    }
}

function jiggle(random) {
    return (random() - 0.5) * 1e-6;
}
