import createDebugger from 'debug';
import { Quadtree, quadtree } from "d3-quadtree";
import { default as Point } from "../geometry/point";
import { default as Position } from "../objects/position";
import { default as Transition } from "../objects/transition";
import { default as Node } from "../objects/node";
import { default as Rectangle } from "../geometry/rectangle";
import { DEBUG_PREFIX } from '../settings';

const debug = createDebugger(`${DEBUG_PREFIX}:physics:collision`);

// ACHTUNG!: Terrible collisions! Urgently destroy the problems! ↓↓↓
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
      tree = quadtree(nodes, xCenter, yCenter).visitAfter(prepare);
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

          const ctpoligon = new Rectangle(quad.size[0], quad.size[1], new Point(xi, yi), rotate);
          const dtpoligon = new Rectangle(quad.size[0], quad.size[1], new Point(data.x, data.y), rotates[data.index]);

          const collision = ctpoligon.polygonsCollision(dtpoligon);
          debug('%o %d', dtpoligon.rotate(rotate), data.index);

          if (collision) {
              const repulsiveForce =  1 / (collision.calcDiscrepancy() / 100000);
              const v = velocity / velocities[data.index];

              const xRectDist = (size[0] + quad.size[0]) / 2;
              const yRectDist = (size[1] + quad.size[1]) / 2;

              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const xd = Math.abs(x) - xRectDist;

              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const yd = Math.abs(y) - yRectDist;

              const nodeSide = collision.calcDirection(0);
              const dataSide = collision.calcDirection(1);

              const cv =  ctpoligon.getVector(nodeSide, nodeSide + 1)
                .getBiNormal()
                .getUnitVector();

              const dv = dtpoligon.getVector(dataSide, dataSide + 1)
                .getBiNormal()
                .getUnitVector();

              node.vx += repulsiveForce / v * cv.dx * strength
              node.vy += repulsiveForce / v * cv.dy * strength
              data.vx += repulsiveForce * v * dv.dx * strength
              data.vy += repulsiveForce * v * dv.dy * strength
            
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
      rotates[i] = node.type == Transition ? (node as Transition).rotateAngle : null,
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
