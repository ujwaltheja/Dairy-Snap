import axios from 'axios';
import type { SceneObject, AIMessage } from '../types';

const BASE_URL = '/api';

export interface GenerateDesignParams {
  description: string;
  sketch_url?: string;
  constraints?: {
    style?: 'edwardian' | 'geometric' | 'modern' | 'vintage' | 'minimalist';
    kernel_format?: string;
  };
}

export interface GenerateDesignResponse {
  variants: Array<{
    id: string;
    name: string;
    description: string;
    objects: SceneObject[];
    preview_url: string;
  }>;
}

export interface SuggestResponse {
  suggestions: Array<{
    id: string;
    type: 'warning' | 'info' | 'optimization';
    message: string;
    action?: string;
    confidence: number;
  }>;
}

export interface OptimizeResponse {
  issues: Array<{
    type: 'manufacturability' | 'stress' | 'aesthetic';
    description: string;
    fix?: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  weight_estimate: number;
  cost_estimate: number;
}

export async function generateDesign(params: GenerateDesignParams): Promise<GenerateDesignResponse> {
  try {
    const { data } = await axios.post(`${BASE_URL}/ai/generate-model`, params, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return data;
  } catch {
    return mockGenerateDesign(params);
  }
}

export async function getSuggestions(scene: SceneObject[], history: string[]): Promise<SuggestResponse> {
  try {
    const { data } = await axios.post(`${BASE_URL}/ai/suggest`, { kernel_scene: scene, history }, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return data;
  } catch {
    return mockSuggestions();
  }
}

export async function optimizeDesign(
  objects: SceneObject[],
  goals: { min_weight?: boolean; eco_friendly?: boolean }
): Promise<OptimizeResponse> {
  try {
    const { data } = await axios.post(`${BASE_URL}/ai/optimize`, {
      kernel_data: btoa(JSON.stringify(objects)),
      goals,
    }, { headers: { Authorization: `Bearer ${getToken()}` } });
    return data;
  } catch {
    return mockOptimize(objects);
  }
}

export async function sendAssistantMessage(messages: AIMessage[], command: string): Promise<string> {
  try {
    const { data } = await axios.post(`${BASE_URL}/ai/assist`, { messages, command }, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return data.response as string;
  } catch {
    return mockAssistantResponse(command);
  }
}

// ─── Mock implementations ──────────────────────────────────────────────────────
function mockGenerateDesign(params: GenerateDesignParams): GenerateDesignResponse {
  const style = params.constraints?.style ?? 'modern';
  return {
    variants: [
      { id: crypto.randomUUID(), name: `${style} Design A`, description: `Elegant ${style} ring inspired by "${params.description}"`, objects: [], preview_url: '' },
      { id: crypto.randomUUID(), name: `${style} Design B`, description: `Bold ${style} variant with enhanced stone setting`, objects: [], preview_url: '' },
      { id: crypto.randomUUID(), name: `${style} Design C`, description: `Minimalist interpretation`, objects: [], preview_url: '' },
    ],
  };
}

function mockSuggestions(): SuggestResponse {
  const pool = [
    { id: '1', type: 'warning' as const, message: 'Thin section near band junction (0.8 mm). Recommend ≥ 1.2 mm for durability.', confidence: 0.87, action: 'Add reinforcement rib' },
    { id: '2', type: 'optimization' as const, message: 'Prong spacing can be optimized for better gem security.', confidence: 0.73, action: 'Auto-space prongs' },
    { id: '3', type: 'info' as const, message: 'Pavé layout detected — consider micro-set for a sleeker finish.', confidence: 0.65 },
    { id: '4', type: 'warning' as const, message: 'Undercut detected on inner shank. May require extra tooling.', confidence: 0.80, action: 'Add 2° draft angle' },
  ];
  const count = Math.floor(Math.random() * 3) + 1;
  return { suggestions: pool.slice(0, count) };
}

function mockOptimize(objects: SceneObject[]): OptimizeResponse {
  return {
    issues: [
      { type: 'manufacturability', description: 'Undercut on inner shank — may need additional tooling.', fix: 'Add 2° draft angle', severity: 'medium' },
      { type: 'stress', description: 'High stress at prong base under load.', fix: 'Increase prong base radius by 0.3 mm', severity: 'high' },
    ],
    weight_estimate: 2.4 + objects.length * 0.3,
    cost_estimate: 180 + objects.length * 25,
  };
}

function mockAssistantResponse(command: string): string {
  const cmd = command.toLowerCase();
  if (cmd.includes('fillet')) {
    const m = cmd.match(/(\d+(?:\.\d+)?)\s*mm/);
    return `✅ Fillet queued: applying ${m ? m[1] : '0.5'} mm radius to all sharp edges for a smoother, organic look.`;
  }
  if (cmd.includes('gold') || cmd.includes('silver') || cmd.includes('platinum')) {
    const metal = cmd.includes('rose gold') ? 'rose-gold'
      : cmd.includes('white gold') ? 'white-gold'
      : cmd.includes('silver') ? 'silver'
      : cmd.includes('platinum') ? 'platinum'
      : 'yellow-gold';
    return `✅ Material changed to ${metal.replace(/-/g, ' ')}. PBR shaders updated with accurate metalness/roughness.`;
  }
  if (cmd.includes('export') || cmd.includes('stl') || cmd.includes('obj') || cmd.includes('gltf')) {
    return `✅ Export initiated. Your design is being serialised. Download will start shortly.`;
  }
  if (cmd.includes('ring size') || cmd.includes('resize')) {
    return `📏 Ring sizing tool activated. Current inner diameter: 17.35 mm (US 7). Use the Ring Sizer panel to adjust.`;
  }
  if (cmd.includes('symmetry') || cmd.includes('mirror')) {
    return `🔄 Symmetry tool active. Mirroring across YZ plane — all subsequent operations will be mirrored.`;
  }
  if (cmd.includes('halo')) {
    return `💍 Halo setting generator activated. Placing ${Math.floor(Math.random() * 6) + 18} micro-pavé diamonds around the centre stone.`;
  }
  return `🤖 **AI-3Design Pro** (mock mode)\n\nI understand: "${command}"\n\nTry:\n• "Fillet all edges to 0.5 mm"\n• "Apply 18K yellow gold finish"\n• "Export as STL"\n• "Ring size US 7"\n• "Add symmetry mirror"\n• "Generate diamond halo setting"`;
}

function getToken(): string {
  return localStorage.getItem('ai3design_token') ?? 'mock-jwt-token';
}
