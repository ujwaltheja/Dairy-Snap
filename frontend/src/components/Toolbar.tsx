import { useSceneStore } from '../store/sceneStore';
import type { ToolType, ViewMode } from '../types';
import {
  MousePointer2, Move, RotateCcw, Maximize2, Gem, CircleDot,
  Layers, Cpu, GitMerge, Scissors, Crosshair, Radius,
  FlipHorizontal2, Ruler, Undo2, Redo2, Download, Bot, Eye,
  Boxes, ScanLine, EyeOff,
} from 'lucide-react';

interface ToolDef {
  id: ToolType;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
  group: string;
}

const TOOLS: ToolDef[] = [
  // Selection
  { id: 'select', label: 'Select', icon: <MousePointer2 size={18} />, shortcut: 'V', group: 'Selection' },
  { id: 'move',   label: 'Move',   icon: <Move size={18} />,           shortcut: 'G', group: 'Selection' },
  { id: 'rotate', label: 'Rotate', icon: <RotateCcw size={18} />,      shortcut: 'R', group: 'Selection' },
  { id: 'scale',  label: 'Scale',  icon: <Maximize2 size={18} />,      shortcut: 'S', group: 'Selection' },
  // Primitives
  { id: 'ring',      label: 'Ring Band',   icon: <CircleDot size={18} />, shortcut: '1', group: 'Primitives' },
  { id: 'gemstone',  label: 'Gemstone',    icon: <Gem size={18} />,       shortcut: '2', group: 'Primitives' },
  { id: 'prong',     label: 'Prong Set',   icon: <Layers size={18} />,    shortcut: '3', group: 'Primitives' },
  { id: 'pave',      label: 'Pavé Row',    icon: <Boxes size={18} />,     shortcut: '4', group: 'Primitives' },
  { id: 'sweep',     label: 'Sweep Path',  icon: <Cpu size={18} />,       shortcut: '5', group: 'Primitives' },
  // Boolean ops
  { id: 'boolean-union',     label: 'Union',     icon: <GitMerge size={18} />,  shortcut: 'U', group: 'Boolean' },
  { id: 'boolean-subtract',  label: 'Subtract',  icon: <Scissors size={18} />,  shortcut: 'D', group: 'Boolean' },
  { id: 'boolean-intersect', label: 'Intersect', icon: <Crosshair size={18} />, shortcut: 'I', group: 'Boolean' },
  // Utilities
  { id: 'fillet',   label: 'Fillet Edge', icon: <Radius size={18} />,          shortcut: 'F', group: 'Utilities' },
  { id: 'symmetry', label: 'Symmetry',    icon: <FlipHorizontal2 size={18} />, shortcut: 'M', group: 'Utilities' },
];

const VIEW_MODES: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
  { id: 'shaded',    label: 'Shaded',    icon: <Eye size={14} /> },
  { id: 'wireframe', label: 'Wireframe', icon: <ScanLine size={14} /> },
  { id: 'split',     label: 'Split',     icon: <EyeOff size={14} /> },
];

const GROUPS = ['Selection', 'Primitives', 'Boolean', 'Utilities'];

export default function Toolbar() {
  const {
    activeTool, setTool,
    viewMode, setViewMode,
    undo, redo, canUndo, canRedo,
    setExportOpen, setAIPanel, isAIPanelOpen,
    addObject, activeMaterial,
  } = useSceneStore();

  const handleToolClick = (tool: ToolType) => {
    setTool(tool);
    if (tool === 'ring') spawnRing();
    if (tool === 'gemstone') spawnGem();
    if (tool === 'prong') spawnProng();
  };

  const spawnRing = () => {
    addObject({
      id: crypto.randomUUID(),
      name: 'Ring Band',
      type: 'ring',
      visible: true,
      locked: false,
      material: activeMaterial,
      parameters: { innerDiameter: 17.35, bandWidth: 3, bandThickness: 2, style: 'plain' },
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });
    setTool('select');
  };

  const spawnGem = () => {
    addObject({
      id: crypto.randomUUID(),
      name: 'Diamond',
      type: 'gemstone',
      visible: true,
      locked: false,
      material: activeMaterial,
      parameters: { cut: 'round-brilliant', gemType: 'diamond', size: 6, depth: 4, carats: 1 },
      position: [0, 0.3, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });
    setTool('select');
  };

  const spawnProng = () => {
    addObject({
      id: crypto.randomUUID(),
      name: 'Prong Setting',
      type: 'prong',
      visible: true,
      locked: false,
      material: activeMaterial,
      parameters: { prongCount: 4, prongHeight: 2, gemRadius: 3 },
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });
    setTool('select');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-700/50 w-16 select-none">
      {/* Top actions */}
      <div className="flex flex-col items-center gap-1 p-2 border-b border-gray-700/50">
        <ActionBtn
          icon={<Undo2 size={16} />}
          label="Undo (Ctrl+Z)"
          onClick={undo}
          disabled={!canUndo()}
        />
        <ActionBtn
          icon={<Redo2 size={16} />}
          label="Redo (Ctrl+Y)"
          onClick={redo}
          disabled={!canRedo()}
        />
      </div>

      {/* Tool groups */}
      <div className="flex-1 overflow-y-auto py-2 space-y-3 scrollbar-thin">
        {GROUPS.map((group) => (
          <div key={group}>
            <div className="text-[9px] text-gray-500 uppercase tracking-widest text-center px-1 mb-1">
              {group.slice(0, 3)}
            </div>
            <div className="flex flex-col items-center gap-1 px-1">
              {TOOLS.filter((t) => t.group === group).map((tool) => (
                <ToolBtn
                  key={tool.id}
                  tool={tool}
                  active={activeTool === tool.id}
                  onClick={() => handleToolClick(tool.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* View mode */}
      <div className="flex flex-col items-center gap-1 p-2 border-t border-gray-700/50">
        {VIEW_MODES.map((vm) => (
          <button
            key={vm.id}
            title={vm.label}
            onClick={() => setViewMode(vm.id)}
            className={`w-10 h-7 flex items-center justify-center rounded text-xs transition-colors ${
              viewMode === vm.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {vm.icon}
          </button>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-1 p-2 border-t border-gray-700/50">
        <ActionBtn
          icon={<Bot size={16} />}
          label="AI Assistant"
          onClick={() => setAIPanel(!isAIPanelOpen)}
          active={isAIPanelOpen}
          className="text-purple-400 hover:text-purple-300"
        />
        <ActionBtn
          icon={<Download size={16} />}
          label="Export"
          onClick={() => setExportOpen(true)}
          className="text-green-400 hover:text-green-300"
        />
        <ActionBtn
          icon={<Ruler size={16} />}
          label="Measure"
          onClick={() => setTool('symmetry')}
        />
      </div>
    </div>
  );
}

function ToolBtn({ tool, active, onClick }: {
  tool: ToolDef;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      title={`${tool.label} [${tool.shortcut}]`}
      onClick={onClick}
      className={`w-11 h-11 flex flex-col items-center justify-center rounded-lg text-[10px] transition-all gap-0.5 ${
        active
          ? 'bg-gold-500/20 text-yellow-400 border border-yellow-500/50 shadow-lg shadow-yellow-500/10'
          : 'text-gray-400 hover:bg-gray-700/70 hover:text-white border border-transparent'
      }`}
    >
      {tool.icon}
    </button>
  );
}

function ActionBtn({ icon, label, onClick, disabled, active, className = '' }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`w-10 h-8 flex items-center justify-center rounded transition-colors ${
        active ? 'bg-purple-600/30 text-purple-300' : ''
      } ${
        disabled
          ? 'opacity-30 cursor-not-allowed text-gray-600'
          : `text-gray-400 hover:bg-gray-700 hover:text-white ${className}`
      }`}
    >
      {icon}
    </button>
  );
}
