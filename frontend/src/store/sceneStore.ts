import { create } from 'zustand';
import type { SceneObject, ToolType, MaterialType, ViewMode, AIMessage } from '../types';

export interface Suggestion {
  id: string;
  type: 'warning' | 'info' | 'optimization';
  message: string;
  action?: string;
  confidence: number;
}

interface SceneState {
  objects: SceneObject[];
  selectedId: string | null;
  activeTool: ToolType;
  viewMode: ViewMode;
  activeMaterial: MaterialType;
  aiMessages: AIMessage[];
  isAIPanelOpen: boolean;
  isInspectorOpen: boolean;
  isGemLibOpen: boolean;
  isSuggestionsOpen: boolean;
  isExportOpen: boolean;
  suggestions: Suggestion[];
  history: SceneObject[][];
  historyIndex: number;

  addObject: (obj: SceneObject) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  selectObject: (id: string | null) => void;
  setTool: (tool: ToolType) => void;
  setViewMode: (mode: ViewMode) => void;
  setMaterial: (mat: MaterialType) => void;
  addAIMessage: (msg: AIMessage) => void;
  setAIPanel: (open: boolean) => void;
  setInspector: (open: boolean) => void;
  setGemLib: (open: boolean) => void;
  setSuggestions: (suggestions: Suggestion[]) => void;
  setSuggestionsOpen: (open: boolean) => void;
  setExportOpen: (open: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const MAX_HISTORY = 50;

export const useSceneStore = create<SceneState>((set, get) => ({
  objects: [],
  selectedId: null,
  activeTool: 'select',
  viewMode: 'shaded',
  activeMaterial: 'yellow-gold',
  aiMessages: [],
  isAIPanelOpen: false,
  isInspectorOpen: true,
  isGemLibOpen: false,
  isSuggestionsOpen: false,
  isExportOpen: false,
  suggestions: [],
  history: [[]],
  historyIndex: 0,

  addObject: (obj) => set((s) => {
    const newObjects = [...s.objects, obj];
    const base = s.history.slice(0, s.historyIndex + 1);
    const history = [...base, newObjects].slice(-MAX_HISTORY);
    return { objects: newObjects, history, historyIndex: history.length - 1 };
  }),

  removeObject: (id) => set((s) => {
    const newObjects = s.objects.filter((o) => o.id !== id);
    const base = s.history.slice(0, s.historyIndex + 1);
    const history = [...base, newObjects].slice(-MAX_HISTORY);
    return { objects: newObjects, selectedId: s.selectedId === id ? null : s.selectedId, history, historyIndex: history.length - 1 };
  }),

  updateObject: (id, updates) => set((s) => {
    const newObjects = s.objects.map((o) => o.id === id ? { ...o, ...updates } : o);
    const base = s.history.slice(0, s.historyIndex + 1);
    const history = [...base, newObjects].slice(-MAX_HISTORY);
    return { objects: newObjects, history, historyIndex: history.length - 1 };
  }),

  selectObject: (id) => set({ selectedId: id }),
  setTool: (tool) => set({ activeTool: tool }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setMaterial: (mat) => set({ activeMaterial: mat }),
  addAIMessage: (msg) => set((s) => ({ aiMessages: [...s.aiMessages, msg] })),
  setAIPanel: (open) => set({ isAIPanelOpen: open }),
  setInspector: (open) => set({ isInspectorOpen: open }),
  setGemLib: (open) => set({ isGemLibOpen: open }),
  setSuggestions: (suggestions) => set({ suggestions }),
  setSuggestionsOpen: (open) => set({ isSuggestionsOpen: open }),
  setExportOpen: (open) => set({ isExportOpen: open }),

  undo: () => set((s) => {
    if (s.historyIndex <= 0) return s;
    const idx = s.historyIndex - 1;
    return { objects: s.history[idx], historyIndex: idx };
  }),

  redo: () => set((s) => {
    if (s.historyIndex >= s.history.length - 1) return s;
    const idx = s.historyIndex + 1;
    return { objects: s.history[idx], historyIndex: idx };
  }),

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));
