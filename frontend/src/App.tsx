import { useEffect, useState } from 'react';
import { useSceneStore } from './store/sceneStore';
import Workspace3D from './components/Workspace3D';
import Toolbar from './components/Toolbar';
import Inspector from './components/Inspector';
import AIAssistant from './components/AIAssistant';
import MaterialPanel from './components/MaterialPanel';
import GemstoneLibrary from './components/GemstoneLibrary';
import ExportModal from './components/ExportModal';
import AuthModal from './components/AuthModal';
import { Gem, LayoutGrid, Layers, User, Bot, Lightbulb } from 'lucide-react';

export default function App() {
  const {
    objects,
    selectedId,
    activeTool,
    isAIPanelOpen,
    isGemLibOpen,
    isExportOpen,
    isInspectorOpen,
    setInspector,
    setGemLib,
    setAIPanel,
    canUndo,
    canRedo,
  } = useSceneStore();

  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('ai3design_user');
    if (stored) {
      try { setUser(JSON.parse(stored) as { name: string }); } catch { /* ignore */ }
    }
  }, [showAuth]);

  const selectedObj = objects.find((o) => o.id === selectedId);

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 text-white overflow-hidden">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700/50 shrink-0 z-20">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Gem size={14} className="text-gray-900" />
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-wide">AI-3Design</span>
            <span className="text-yellow-400 font-bold text-sm"> Pro</span>
          </div>
          <span className="text-[10px] bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded-full ml-1">
            BETA
          </span>
        </div>

        {/* Centre status */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Scene ready
          </span>
          <span className="text-gray-600">·</span>
          <span>{objects.length} object{objects.length !== 1 ? 's' : ''}</span>
          {selectedObj && (
            <>
              <span className="text-gray-600">·</span>
              <span className="text-yellow-400">{selectedObj.name}</span>
            </>
          )}
          <span className="text-gray-600">·</span>
          <span className="text-gray-500 capitalize">{activeTool}</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <HeaderBtn
            icon={<Gem size={14} />}
            label="Gems"
            active={isGemLibOpen}
            onClick={() => setGemLib(!isGemLibOpen)}
            color="text-yellow-400"
          />
          <HeaderBtn
            icon={<LayoutGrid size={14} />}
            label="Inspector"
            active={isInspectorOpen}
            onClick={() => setInspector(!isInspectorOpen)}
          />
          <HeaderBtn
            icon={<Bot size={14} />}
            label="AI"
            active={isAIPanelOpen}
            onClick={() => setAIPanel(!isAIPanelOpen)}
            color="text-purple-400"
          />
          <div className="w-px h-5 bg-gray-700 mx-1" />
          <button
            onClick={() => setShowAuth(true)}
            className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            <User size={12} />
            {user ? user.name : 'Sign In'}
          </button>
        </div>
      </header>

      {/* ─── Main layout ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left toolbar */}
        <Toolbar />

        {/* Centre — 3D canvas + material panel */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <MaterialPanel />
          <div className="flex-1 relative">
            <Workspace3D />

            {/* Floating hint */}
            {objects.length === 0 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 text-xs text-gray-300 px-4 py-2.5 rounded-full pointer-events-none">
                <Lightbulb size={12} className="text-yellow-400" />
                Use the toolbar on the left to add a ring or gemstone · Press AI to chat with the assistant
              </div>
            )}

            {/* Floating kbd hints */}
            <div className="absolute top-4 right-4 flex flex-col gap-1 text-[10px] text-gray-600 pointer-events-none">
              <span>Del — delete</span>
              <span>Ctrl+Z — undo {canUndo() ? '' : '(empty)'}</span>
              <span>Ctrl+Y — redo {canRedo() ? '' : '(empty)'}</span>
            </div>
          </div>
        </div>

        {/* Right inspector */}
        {isInspectorOpen && (
          <Inspector />
        )}

        {/* Floating gem library */}
        {isGemLibOpen && <GemstoneLibrary />}
      </div>

      {/* ─── AI Assistant panel (bottom) ─────────────────────────────────────── */}
      {isAIPanelOpen && (
        <div className="shrink-0 z-10">
          <AIAssistant />
        </div>
      )}

      {/* ─── Status bar ──────────────────────────────────────────────────────── */}
      <footer className="flex items-center justify-between px-4 py-1 bg-gray-900 border-t border-gray-700/50 text-[10px] text-gray-500 shrink-0">
        <div className="flex items-center gap-3">
          <span>AI-3Design Pro v0.1.0</span>
          <span className="text-gray-700">·</span>
          <span>React + Three.js + WebGL</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Mock Mode Active</span>
          <span className="text-gray-700">·</span>
          <span>WebGL 2.0</span>
          <span className="text-gray-700">·</span>
          <span className="flex items-center gap-1">
            <Layers size={9} />
            {objects.length} obj
          </span>
        </div>
      </footer>

      {/* ─── Modals ──────────────────────────────────────────────────────────── */}
      {isExportOpen && <ExportModal />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

function HeaderBtn({ icon, label, active, onClick, color = 'text-gray-300' }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
        active
          ? 'bg-gray-700 border-gray-500 text-white'
          : `bg-transparent border-transparent hover:bg-gray-800 hover:border-gray-600 ${color}`
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
