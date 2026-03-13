import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { v4 as uuid } from 'uuid';

const router = Router();

// POST /api/ai/generate-model
router.post('/generate-model', authenticate, (req: AuthRequest, res: Response) => {
  const { description = '', constraints = {} } = req.body as {
    description: string;
    constraints?: { style?: string };
  };
  const style = constraints.style ?? 'modern';

  res.json({
    variants: [
      { id: uuid(), name: `${style} Design A`, description: `Elegant ${style} ring based on: "${description}"`, objects: [], preview_url: '' },
      { id: uuid(), name: `${style} Design B`, description: `Bold ${style} variant with enhanced setting`, objects: [], preview_url: '' },
      { id: uuid(), name: `${style} Design C`, description: 'Minimalist interpretation', objects: [], preview_url: '' },
    ],
  });
});

// POST /api/ai/suggest
router.post('/suggest', authenticate, (req: AuthRequest, res: Response) => {
  const { kernel_scene = [] } = req.body as { kernel_scene: unknown[]; history?: string[] };
  const count = kernel_scene.length;

  const suggestions = [
    { id: uuid(), type: 'warning', message: 'Thin section detected near band junction (0.8 mm). Recommend ≥ 1.2 mm.', confidence: 0.87, action: 'Add reinforcement rib' },
    { id: uuid(), type: 'optimization', message: 'Prong spacing can be optimised for better gem security.', confidence: 0.73, action: 'Auto-space prongs' },
    { id: uuid(), type: 'info', message: `Scene has ${count} object(s). Consider grouping related elements.`, confidence: 0.60 },
  ];

  res.json({ suggestions: suggestions.slice(0, Math.max(1, Math.min(count + 1, 3))) });
});

// POST /api/ai/optimize
router.post('/optimize', authenticate, (req: AuthRequest, res: Response) => {
  const { goals = {} } = req.body as { kernel_data?: string; goals?: { min_weight?: boolean } };

  res.json({
    issues: [
      { type: 'manufacturability', description: 'Undercut on inner shank — may need extra tooling.', fix: 'Add 2° draft angle', severity: 'medium' },
      { type: 'stress', description: 'High stress at prong base under load simulation.', fix: 'Increase prong base radius by 0.3 mm', severity: 'high' },
    ],
    weight_estimate: goals.min_weight ? 1.8 : 2.4,
    cost_estimate: goals.min_weight ? 145 : 220,
  });
});

// POST /api/ai/assist
router.post('/assist', authenticate, (req: AuthRequest, res: Response) => {
  const { command = '' } = req.body as { messages?: unknown[]; command: string };
  const cmd = command.toLowerCase();

  let response = `🤖 Command received: "${command}". (Backend mock mode — connect a real LLM endpoint via AI_API_KEY env var for production responses.)`;

  if (cmd.includes('fillet')) {
    const m = cmd.match(/(\d+(?:\.\d+)?)\s*mm/);
    response = `✅ Fillet operation: ${m ? m[1] : '0.5'} mm radius applied to all sharp edges.`;
  } else if (cmd.includes('gold') || cmd.includes('silver') || cmd.includes('platinum')) {
    response = `✅ Material updated. PBR shader parameters recalculated.`;
  } else if (cmd.includes('export')) {
    response = `✅ Export queued. Use the Export button (↓) in the toolbar or header.`;
  }

  res.json({ response });
});

export default router;
