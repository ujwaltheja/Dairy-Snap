import * as THREE from 'three';
import type { RingParams, GemstoneParams } from '../types';

// ─── Parametric Ring Generator ───────────────────────────────────────────────
export function createRingGeometry(params: RingParams): THREE.BufferGeometry {
  const { innerDiameter, bandThickness, style } = params;
  const outerRadius = innerDiameter / 2 + bandThickness;
  const innerRadius = innerDiameter / 2;
  const midRadius = (outerRadius + innerRadius) / 2;
  const tubeRadius = bandThickness / 2;
  const segments = 64;
  const tubeSegments = 32;

  if (style === 'cathedral') {
    // Cathedral: torus with slight vertical lift at center via a custom profile
    const curve = new THREE.CatmullRomCurve3(
      Array.from({ length: tubeSegments + 1 }, (_, i) => {
        const angle = (i / tubeSegments) * Math.PI * 2;
        const lift = tubeRadius * 0.4 * Math.abs(Math.cos(angle));
        return new THREE.Vector3(
          midRadius * Math.cos(angle),
          lift,
          midRadius * Math.sin(angle)
        );
      }),
      true
    );
    const geo = new THREE.TubeGeometry(curve, segments, tubeRadius, 12, true);
    return geo;
  }

  if (style === 'split-shank') {
    const geos: THREE.BufferGeometry[] = [];
    const splitOffset = tubeRadius * 0.5;
    for (const offset of [-splitOffset, splitOffset]) {
      const curve = new THREE.CatmullRomCurve3(
        Array.from({ length: tubeSegments + 1 }, (_, i) => {
          const angle = (i / tubeSegments) * Math.PI * 2;
          const spread = Math.abs(Math.cos(angle)) * splitOffset * 1.2;
          return new THREE.Vector3(
            midRadius * Math.cos(angle),
            offset + (offset > 0 ? spread : -spread),
            midRadius * Math.sin(angle)
          );
        }),
        true
      );
      geos.push(new THREE.TubeGeometry(curve, segments, tubeRadius * 0.55, 8, true));
    }
    return mergeGeometries(geos);
  }

  // Plain (and halo base) — simple torus
  return new THREE.TorusGeometry(midRadius, tubeRadius, tubeSegments, segments);
}

// ─── Gemstone Geometry Generators ────────────────────────────────────────────
export function createGemstoneGeometry(params: GemstoneParams): THREE.BufferGeometry {
  const { cut, size, depth } = params;
  const radius = size / 2;

  switch (cut) {
    case 'round-brilliant': return createRoundBrilliant(radius, depth);
    case 'emerald':         return createEmeraldCut(radius, depth);
    case 'princess':        return createPrincessCut(radius, depth);
    case 'oval':            return createOvalCut(radius, depth);
    case 'marquise':        return createMarquiseCut(radius, depth);
    case 'pear':            return createPearCut(radius, depth);
    default:                return createRoundBrilliant(radius, depth);
  }
}

function createRoundBrilliant(radius: number, depth: number): THREE.BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];
  const facets = 32;
  const tableRadius = radius * 0.53;
  const crownHeight = depth * 0.35;
  const pavilionDepth = depth * 0.65;

  // Table centre
  vertices.push(0, crownHeight, 0);
  // Table ring
  for (let i = 0; i < facets; i++) {
    const a = (i / facets) * Math.PI * 2;
    vertices.push(tableRadius * Math.cos(a), crownHeight, tableRadius * Math.sin(a));
  }
  // Girdle ring
  const girdleStart = vertices.length / 3;
  for (let i = 0; i < facets; i++) {
    const a = (i / facets) * Math.PI * 2;
    vertices.push(radius * Math.cos(a), 0, radius * Math.sin(a));
  }
  // Culet
  const culetIdx = vertices.length / 3;
  vertices.push(0, -pavilionDepth, 0);

  // Table fan
  for (let i = 0; i < facets; i++) {
    indices.push(0, 1 + i, 1 + ((i + 1) % facets));
  }
  // Crown sides
  for (let i = 0; i < facets; i++) {
    const a = 1 + i, b = 1 + ((i + 1) % facets);
    const c = girdleStart + i, d = girdleStart + ((i + 1) % facets);
    indices.push(a, c, b);
    indices.push(b, c, d);
  }
  // Pavilion
  for (let i = 0; i < facets; i++) {
    indices.push(girdleStart + i, culetIdx, girdleStart + ((i + 1) % facets));
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function createEmeraldCut(radius: number, depth: number): THREE.BufferGeometry {
  const w = radius, l = radius * 1.4, ch = radius * 0.15;
  const shape = new THREE.Shape();
  shape.moveTo(-l + ch, -w);
  shape.lineTo(l - ch, -w);
  shape.lineTo(l, -w + ch);
  shape.lineTo(l, w - ch);
  shape.lineTo(l - ch, w);
  shape.lineTo(-l + ch, w);
  shape.lineTo(-l, w - ch);
  shape.lineTo(-l, -w + ch);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.1,
    bevelSize: ch * 0.5,
    bevelSegments: 2,
  });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, depth / 2, 0);
  return geo;
}

function createPrincessCut(radius: number, depth: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const s = radius;
  shape.moveTo(-s, -s); shape.lineTo(s, -s);
  shape.lineTo(s, s);   shape.lineTo(-s, s);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: depth * 0.08,
    bevelSize: s * 0.05,
    bevelSegments: 2,
  });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, depth / 2, 0);
  return geo;
}

function createOvalCut(radius: number, depth: number): THREE.BufferGeometry {
  const pts = new THREE.EllipseCurve(0, 0, radius * 1.3, radius, 0, Math.PI * 2, false, 0).getPoints(32);
  const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), {
    depth, bevelEnabled: true, bevelThickness: depth * 0.1, bevelSegments: 3,
  });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, depth / 2, 0);
  return geo;
}

function createMarquiseCut(radius: number, depth: number): THREE.BufferGeometry {
  const pts = Array.from({ length: 33 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2;
    return new THREE.Vector2(radius * 1.5 * Math.cos(a), radius * 0.6 * Math.sin(a));
  });
  const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), {
    depth, bevelEnabled: true, bevelThickness: depth * 0.1, bevelSegments: 2,
  });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, depth / 2, 0);
  return geo;
}

function createPearCut(radius: number, depth: number): THREE.BufferGeometry {
  const pts = Array.from({ length: 33 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2;
    const r = radius * (0.6 + 0.4 * Math.cos(a / 2));
    return new THREE.Vector2(r * Math.cos(a), r * 1.3 * Math.sin(a));
  });
  const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), {
    depth, bevelEnabled: true, bevelThickness: depth * 0.1, bevelSegments: 2,
  });
  geo.rotateX(Math.PI / 2);
  geo.translate(0, depth / 2, 0);
  return geo;
}

// ─── Prong Setting Generator ──────────────────────────────────────────────────
export function createProngSetting(
  gemRadius: number,
  prongCount: number = 4,
  prongHeight: number = 2
): THREE.BufferGeometry[] {
  const prongRadius = gemRadius * 0.08;
  const placementRadius = gemRadius * 1.05;
  return Array.from({ length: prongCount }, (_, i) => {
    const angle = (i / prongCount) * Math.PI * 2;
    const geo = new THREE.CylinderGeometry(prongRadius * 0.6, prongRadius, prongHeight, 8);
    geo.translate(
      placementRadius * Math.cos(angle),
      prongHeight / 2,
      placementRadius * Math.sin(angle)
    );
    return geo;
  });
}

// ─── Pavé Layout Generator ────────────────────────────────────────────────────
export function createPaveLayout(
  bandRadius: number,
  gemSize: number,
  rows: number = 2
): { position: [number, number, number]; rotation: [number, number, number] }[] {
  const spacing = gemSize * 1.3;
  const count = Math.floor((Math.PI * 2 * bandRadius) / spacing);
  const placements: { position: [number, number, number]; rotation: [number, number, number] }[] = [];

  for (let row = 0; row < rows; row++) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const rowOffset = (row - (rows - 1) / 2) * spacing;
      placements.push({
        position: [bandRadius * Math.cos(angle), rowOffset, bandRadius * Math.sin(angle)],
        rotation: [0, angle, 0],
      });
    }
  }
  return placements;
}

// ─── Geometry Merge Helper ────────────────────────────────────────────────────
export function mergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  let offset = 0;

  for (const geo of geos) {
    const pos = geo.getAttribute('position');
    const norm = geo.getAttribute('normal');
    const idx = geo.getIndex();
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      if (norm) normals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
    }
    if (idx) {
      for (let i = 0; i < idx.count; i++) indices.push(idx.getX(i) + offset);
    }
    offset += pos.count;
  }

  merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  if (normals.length) merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  merged.setIndex(indices);
  merged.computeVertexNormals();
  return merged;
}

// ─── Ring Sizer ───────────────────────────────────────────────────────────────
export const RING_SIZES: Record<string, number> = {
  'US 4': 14.86, 'US 5': 15.70, 'US 6': 16.51,
  'US 7': 17.35, 'US 8': 18.19, 'US 9': 19.02,
  'US 10': 19.84, 'US 11': 20.68, 'US 12': 21.49,
};

export function mmToRingSize(diameter: number): string {
  const entries = Object.entries(RING_SIZES);
  return entries.reduce((prev, curr) =>
    Math.abs(curr[1] - diameter) < Math.abs(prev[1] - diameter) ? curr : prev
  )[0];
}

// ─── Weight & Cost Estimators ─────────────────────────────────────────────────
const METAL_DENSITY: Record<string, number> = {
  'yellow-gold': 19.3,
  'white-gold': 14.7,
  'rose-gold': 15.2,
  'silver': 10.5,
  'platinum': 21.45,
};

export function estimateWeight(volumeCm3: number, material: string): number {
  return volumeCm3 * (METAL_DENSITY[material] ?? 14.0);
}

export function estimateCost(weightGrams: number, material: string): number {
  const price: Record<string, number> = {
    'yellow-gold': 62, 'white-gold': 55, 'rose-gold': 58, 'silver': 0.8, 'platinum': 32,
  };
  return weightGrams * (price[material] ?? 30);
}
