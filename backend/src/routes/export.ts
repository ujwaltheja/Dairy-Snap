import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

interface SceneObject {
  id: string;
  name: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  parameters: Record<string, number | string | boolean>;
}

// POST /api/export
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const { format = 'stl', scale = 1, objects = [] } = req.body as {
    format: 'stl' | 'obj' | 'gltf';
    scale: number;
    objects: SceneObject[];
  };

  if (!['stl', 'obj', 'gltf'].includes(format)) {
    res.status(400).json({ error: 'Invalid format. Supported: stl, obj, gltf' });
    return;
  }

  // In a real implementation this would run a server-side meshing pipeline.
  // For now we generate a minimal valid file for each format as a placeholder.
  let content: string;
  let contentType: string;
  let filename: string;

  if (format === 'stl') {
    content = generateStlPlaceholder(objects, scale);
    contentType = 'application/octet-stream';
    filename = 'jewelry-design.stl';
  } else if (format === 'obj') {
    content = generateObjPlaceholder(objects, scale);
    contentType = 'text/plain';
    filename = 'jewelry-design.obj';
  } else {
    content = JSON.stringify(generateGltfPlaceholder(objects, scale), null, 2);
    contentType = 'application/json';
    filename = 'jewelry-design.gltf';
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(content);
});

function generateStlPlaceholder(objects: SceneObject[], scale: number): string {
  const lines = ['solid jewelry_design'];
  for (const obj of objects) {
    const s = scale;
    const [x, y, z] = obj.position;
    lines.push(`  facet normal 0 0 1`);
    lines.push(`    outer loop`);
    lines.push(`      vertex ${(x - 1) * s} ${y * s} ${z * s}`);
    lines.push(`      vertex ${(x + 1) * s} ${y * s} ${z * s}`);
    lines.push(`      vertex ${x * s} ${(y + 1) * s} ${z * s}`);
    lines.push(`    endloop`);
    lines.push(`  endfacet`);
  }
  lines.push('endsolid jewelry_design');
  return lines.join('\n');
}

function generateObjPlaceholder(objects: SceneObject[], scale: number): string {
  const lines = ['# AI-3Design Pro Export', '# Objects: ' + objects.length, ''];
  let vIdx = 1;
  for (const obj of objects) {
    lines.push(`# Object: ${obj.name}`);
    lines.push(`o ${obj.name.replace(/\s+/g, '_')}`);
    const [x, y, z] = obj.position;
    const s = scale;
    lines.push(`v ${(x - 1) * s} ${y * s} ${z * s}`);
    lines.push(`v ${(x + 1) * s} ${y * s} ${z * s}`);
    lines.push(`v ${x * s} ${(y + 1) * s} ${z * s}`);
    lines.push(`f ${vIdx} ${vIdx + 1} ${vIdx + 2}`);
    vIdx += 3;
    lines.push('');
  }
  return lines.join('\n');
}

function generateGltfPlaceholder(objects: SceneObject[], scale: number) {
  return {
    asset: { version: '2.0', generator: 'AI-3Design Pro v0.1.0' },
    scene: 0,
    scenes: [{ name: 'Jewelry Design', nodes: objects.map((_, i) => i) }],
    nodes: objects.map((obj, i) => ({
      name: obj.name,
      mesh: i,
      translation: obj.position.map((v) => v * scale),
      rotation: [0, 0, 0, 1],
      scale: obj.scale.map((v) => v * scale),
    })),
    meshes: objects.map((obj) => ({
      name: obj.name,
      primitives: [{ attributes: { POSITION: 0 }, mode: 4 }],
    })),
    exportMeta: { format: 'gltf', scale, exportedAt: new Date().toISOString(), objectCount: objects.length },
  };
}

export default router;
