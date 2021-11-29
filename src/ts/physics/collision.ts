import { Position } from "../objects/position.js";
import { Transition } from "../objects/transition.js";
import { Node } from "../objects/node.js";
import { Quadtree } from "d3-quadtree";
import { PolygonVector } from "./polygonVector.js";

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
        tree: Quadtree<any>,
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

                node.vx += (x *= l) * v;
                node.vy += (y *= l) * v;
    
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
              const deb = (((x ** 2 / (ri + xSemiSize) ** 2)) + ((y ** 2 / (ri + ySemiSize) ** 2))) / (v * strength / 25);

              if (x === 0) x = jiggle(random), x *= x;
              if (y === 0) y = jiggle(random), y *= y;

              node.vx += (x / deb);
              node.vy += (y / deb);

              data.vx -= (x / deb);
              data.vy -= (y / deb);
            }
            return;
          }
        }

        if (node.type == Transition && data.type == Transition) {

          const xSemiSize = quad.size[0] / 2;
          const ySemiSize = quad.size[1] / 2;

          const cpoints = [
            { X: xi - xSemiSize, Y: yi - ySemiSize },
            { X: xi + xSemiSize, Y: yi - ySemiSize },
            { X: xi + xSemiSize, Y: yi + ySemiSize },
            { X: xi - xSemiSize, Y: yi + ySemiSize }
          ]

          const dpoints = [
            { X: data.x - xSemiSize, Y: data.y - ySemiSize },
            { X: data.x + xSemiSize, Y: data.y - ySemiSize },
            { X: data.x + xSemiSize, Y: data.y + ySemiSize },
            { X: data.x - xSemiSize, Y: data.y + ySemiSize }
          ]

          const ctpoints = cpoints.map(function (point) {
            return rotateTransform(point, { X0: xi, Y0: yi }, Math.PI * rotate / 180);
          });

          const dtpoints = dpoints.map(function (point) {
            return rotateTransform(point, { X0: data.x, Y0: data.y }, Math.PI * rotates[data.index] / 180);
          });

          const discrepancy = PolygonsCollision(ctpoints, dtpoints);

          if (discrepancy) {
              const repulsiveForce = 0 // 1 / (discrepancy / (velocities[data.index] + velocity));
              const v = velocity / velocities[data.index];

              const minX = ctpoints.reduce(function (prev, current) {
                 return current.X < prev.X ? current : prev
              }).X;
              const minY = ctpoints.reduce(function (prev, current) {
                return current.Y < prev.Y ? current : prev
              }).Y;
              const maxX = ctpoints.reduce(function (prev, current) {
                return current.X > prev.X ? current : prev
              }).X;
              const maxY = ctpoints.reduce(function (prev, current) {
                return current.Y > prev.Y ? current : prev
              }).Y;

              const minDX = dtpoints.reduce(function (prev, current) {
                return current.X < prev.X ? current : prev
              }).X;
              const minDY = dtpoints.reduce(function (prev, current) {
                return current.Y < prev.Y ? current : prev
              }).Y;
              const maxDX = dtpoints.reduce(function (prev, current) {
                return current.X > prev.X ? current : prev
              }).X;
              const maxDY = dtpoints.reduce(function (prev, current) {
                return current.Y > prev.Y ? current : prev
              }).Y;

              const xCrit = ((maxX - minX) + (maxDX - minDX)) / 2; 
              const yCrit = ((maxY - minY) + (maxDY - minDY)) / 2;

              const xRectDist = (size[0] + quad.size[0]) / 2;
              const yRectDist = (size[1] + quad.size[1]) / 2;
              // const xRectDist = (size[0] + quad.size[0]) / 2;
              // const yRectDist = (size[1] + quad.size[1]) / 2;

              const xd = Math.abs(x) - xRectDist;
              const yd = Math.abs(y) - yRectDist;
              // node.vx -= (x *= xd / Math.sqrt(l) * strength) * v * Math.sin(Math.PI * rotate / 180)
              // data.vx += x * (1 - v) * Math.cos(Math.PI * rotates[data.index] / 180)
              const newXd = Math.abs(x) - xCrit;
              const newYd = Math.abs(y) - yCrit;

              const tanC = Math.tan(Math.PI * rotate / 180);
              const tanD = Math.tan(Math.PI * rotates[data.index] / 180);

              let dy = tanD / (tanD + 1);
              dy = isFinite(tanD) ? dy : Math.sign(tanD);
              let dx = 1 - dy;

              let cy = tanC / (tanC + 1);
              cy = isFinite(tanC) ? cy : Math.sign(tanC);
              let cx = 1 - cy;

              let cond = Math.abs(newXd) < Math.abs(newYd);

              let delta;
              if (cond) {
                delta = x * strength;

                node.vx += delta * repulsiveForce * v * cx
                node.vy += delta * repulsiveForce * v * cy
                data.vx -= delta * repulsiveForce * (1 / v) * dx
                data.vy -= delta * repulsiveForce * (1 / v) * dy
                
              } else {
                delta = y * strength;

                node.vx += delta * repulsiveForce * v * cy
                node.vy += delta * repulsiveForce * v * cx
                data.vx += delta * repulsiveForce * (1 / v) * (dy) // TODO !
                data.vy -= delta * repulsiveForce * (1 / v) * (dx)
              }
            } 
          return;
        }
        // return node.type == Position ? x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r 
        //   : node.type == Transition ? x0 > xi + xRectDist || y0 > yi + yRectDist || x1 < xi - xRectDist || y1 < yi - yRectDist : false;
      }
    }
  }

  /**
   * @param a an array of connected points (clockwise) [{x:, y:}, {x:, y:},...] that form a closed polygon
   * @param b an array of connected points (clockwise) [{x:, y:}, {x:, y:},...] that form a closed polygon
   * @return PolygonVector object if there is any intersection between the 2 polygons, false otherwise
   */
  function PolygonsCollision(a, b) {
    const polygons = [a, b];
    const min = [], max = [];
    let projected;

    const result = new PolygonVector(a, b);

    for (let indexPolygon = 0; indexPolygon < polygons.length; indexPolygon++) {
        const polygon = polygons[indexPolygon];
        const nextIndexPolygon = (indexPolygon + 1) % 2;
        
        for (let indexEdge = 0; indexEdge < polygon.length; indexEdge++) {

            const p1 = polygon[indexEdge];
            const p2 = polygon[(indexEdge + 1) % polygon.length];

            const normal = { X: p2.Y - p1.Y, Y: p1.X - p2.X };
            
            for (let index = 0; index < polygons.length; index++) {
              min[index] = Infinity, max[index] = -Infinity;

              for (let j = 0; j < polygons[index].length; j++) {
                projected = normal.X * polygons[index][j].X + normal.Y * polygons[index][j].Y;

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
            result.vectors[indexPolygon][indexEdge] = { X: max[nextIndexPolygon] - min[indexPolygon], Y: max[indexPolygon] - min[nextIndexPolygon] };
        }
    }
    result.isCollide = true;
    return result;
  }

  function rotateTransform(
    point: { X: number, Y: number },
    centerPoint: { X0: number, Y0: number },
    alpha: number
  ): { X: number, Y: number } {
    const X = (point.X - centerPoint.X0) * Math.cos(alpha) - (point.Y - centerPoint.Y0) * Math.sin(alpha) + centerPoint.X0;
    const Y = (point.X - centerPoint.X0) * Math.sin(alpha) + (point.Y - centerPoint.Y0) * Math.cos(alpha) + centerPoint.Y0;

    return {X, Y};
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
