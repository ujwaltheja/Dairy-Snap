export type ToolType =
  | 'select'
  | 'move'
  | 'rotate'
  | 'scale'
  | 'ring'
  | 'prong'
  | 'pave'
  | 'sweep'
  | 'boolean-union'
  | 'boolean-subtract'
  | 'boolean-intersect'
  | 'fillet'
  | 'symmetry'
  | 'gemstone';

export type GemCut = 'round-brilliant' | 'emerald' | 'princess' | 'oval' | 'marquise' | 'pear';
export type GemType = 'diamond' | 'emerald' | 'ruby' | 'sapphire' | 'amethyst' | 'topaz';
export type MaterialType = 'yellow-gold' | 'white-gold' | 'rose-gold' | 'silver' | 'platinum';
export type ViewMode = 'shaded' | 'wireframe' | 'split';
export type ExportFormat = 'stl' | 'obj' | 'gltf';

export interface SceneObject {
  id: string;
  name: string;
  type: 'ring' | 'gemstone' | 'prong' | 'pave' | 'custom' | 'group';
  visible: boolean;
  locked: boolean;
  material: MaterialType;
  parameters: Record<string, number | string | boolean>;
  children?: string[];
  parentId?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface GemstoneParams {
  cut: GemCut;
  gemType: GemType;
  size: number;
  depth: number;
  carats: number;
  color: string;
}

export interface RingParams {
  innerDiameter: number;
  bandWidth: number;
  bandThickness: number;
  style: 'plain' | 'cathedral' | 'split-shank' | 'halo';
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface DesignHistory {
  id: string;
  timestamp: Date;
  action: string;
  objects: SceneObject[];
}
