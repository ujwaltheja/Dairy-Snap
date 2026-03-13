import { useSceneStore } from '../store/sceneStore';
import type { MaterialType, RingParams } from '../types';
import { Trash2, Eye, EyeOff, Lock, Unlock, ChevronDown } from 'lucide-react';
import { METAL_MATERIALS } from '../lib/gemPrimitives';
import { mmToRingSize } from '../lib/cadKernel';
import { useState } from 'react';

const MATERIAL_SWATCHES: { id: MaterialType; label: string; hex: string }[] = [
  { id: 'yellow-gold', label: '18K Yellow Gold', hex: '#FFD700' },
  { id: 'white-gold',  label: '18K White Gold',  hex: '#E8E8E8' },
  { id: 'rose-gold',   label: '18K Rose Gold',   hex: '#E8A090' },
  { id: 'silver',      label: 'Sterling Silver', hex: '#C0C0C0' },
  { id: 'platinum',    label: 'Platinum',         hex: '#E5E4E2' },
];

const RING_STYLES = ['plain', 'cathedral', 'split-shank', 'halo'] as const;

export default function Inspector() {
  const { objects, selectedId, updateObject, removeObject, selectObject } = useSceneStore();
  const selected = objects.find((o) => o.id === selectedId) ?? null;
  const [expandedSection, setExpandedSection] = useState<string | null>('transform');

  const toggle = (s: string) => setExpandedSection((p) => (p === s ? null : s));

  const updateParam = (key: string, value: number | string | boolean) => {
    if (!selected) return;
    updateObject(selected.id, { parameters: { ...selected.parameters, [key]: value } });
  };

  const updatePos = (axis: 0 | 1 | 2, value: number) => {
    if (!selected) return;
    const pos = [...selected.position] as [number, number, number];
    pos[axis] = value;
    updateObject(selected.id, { position: pos });
  };

  const updateRot = (axis: 0 | 1 | 2, value: number) => {
    if (!selected) return;
    const rot = [...selected.rotation] as [number, number, number];
    rot[axis] = value;
    updateObject(selected.id, { rotation: rot });
  };

  const updateScale = (axis: 0 | 1 | 2, value: number) => {
    if (!selected) return;
    const sc = [...selected.scale] as [number, number, number];
    sc[axis] = value;
    updateObject(selected.id, { scale: sc });
  };

  // Object list panel (scene hierarchy)
  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700/50 w-72 text-sm text-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
        <span className="font-semibold text-white text-xs uppercase tracking-wider">Inspector</span>
        {selected && (
          <div className="flex items-center gap-1">
            <button
              title="Toggle visibility"
              onClick={() => updateObject(selected.id, { visible: !selected.visible })}
              className="p-1 text-gray-400 hover:text-white rounded"
            >
              {selected.visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            <button
              title="Lock/unlock"
              onClick={() => updateObject(selected.id, { locked: !selected.locked })}
              className="p-1 text-gray-400 hover:text-white rounded"
            >
              {selected.locked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
            <button
              title="Delete object"
              onClick={() => { removeObject(selected.id); selectObject(null); }}
              className="p-1 text-red-400 hover:text-red-300 rounded"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!selected ? (
          <EmptyState objects={objects} onSelect={selectObject} />
        ) : (
          <>
            {/* Object name */}
            <div className="px-4 py-2 border-b border-gray-700/30">
              <input
                className="w-full bg-gray-800 text-white text-sm px-3 py-1.5 rounded border border-gray-600 focus:outline-none focus:border-yellow-500"
                value={selected.name}
                onChange={(e) => updateObject(selected.id, { name: e.target.value })}
              />
              <div className="mt-1 text-[10px] text-gray-500">
                {selected.type.toUpperCase()} · {selected.id.slice(0, 8)}
              </div>
            </div>

            {/* Transform */}
            <Section title="Transform" id="transform" expanded={expandedSection} onToggle={toggle}>
              <div className="space-y-2">
                <XYZRow label="Position" values={selected.position} onChange={updatePos} step={0.1} />
                <XYZRow label="Rotation" values={selected.rotation} onChange={updateRot} step={0.01} />
                <XYZRow label="Scale" values={selected.scale} onChange={updateScale} step={0.05} min={0.01} />
              </div>
            </Section>

            {/* Material */}
            <Section title="Material" id="material" expanded={expandedSection} onToggle={toggle}>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {MATERIAL_SWATCHES.map((m) => (
                  <button
                    key={m.id}
                    title={m.label}
                    onClick={() => updateObject(selected.id, { material: m.id })}
                    className={`w-full aspect-square rounded-full border-2 transition-all ${
                      selected.material === m.id ? 'border-yellow-400 scale-110' : 'border-gray-600 hover:border-gray-400'
                    }`}
                    style={{ background: m.hex }}
                  />
                ))}
              </div>
              <div className="text-[11px] text-gray-400 text-center">
                {MATERIAL_SWATCHES.find((m) => m.id === selected.material)?.label}
              </div>
            </Section>

            {/* Ring-specific params */}
            {selected.type === 'ring' && (
              <Section title="Ring Parameters" id="ring" expanded={expandedSection} onToggle={toggle}>
                <ParamRow
                  label="Inner Ø (mm)"
                  value={selected.parameters.innerDiameter as number ?? 17.35}
                  onChange={(v) => updateParam('innerDiameter', v)}
                  min={10} max={25} step={0.1}
                />
                <div className="text-[10px] text-yellow-400 text-center mb-2">
                  {mmToRingSize(selected.parameters.innerDiameter as number ?? 17.35)}
                </div>
                <ParamRow
                  label="Band Width (mm)"
                  value={selected.parameters.bandWidth as number ?? 3}
                  onChange={(v) => updateParam('bandWidth', v)}
                  min={1} max={10} step={0.1}
                />
                <ParamRow
                  label="Thickness (mm)"
                  value={selected.parameters.bandThickness as number ?? 2}
                  onChange={(v) => updateParam('bandThickness', v)}
                  min={0.5} max={6} step={0.1}
                />
                <div className="mt-2">
                  <label className="text-[11px] text-gray-400 block mb-1">Style</label>
                  <select
                    className="w-full bg-gray-800 text-white text-xs px-2 py-1.5 rounded border border-gray-600 focus:outline-none focus:border-yellow-500"
                    value={selected.parameters.style as string ?? 'plain'}
                    onChange={(e) => updateParam('style', e.target.value)}
                  >
                    {RING_STYLES.map((s) => (
                      <option key={s} value={s}>{s.replace('-', ' ').replace(/^\w/, (c) => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
              </Section>
            )}

            {/* Gemstone-specific params */}
            {selected.type === 'gemstone' && (
              <Section title="Gem Parameters" id="gem" expanded={expandedSection} onToggle={toggle}>
                <div className="mb-2">
                  <label className="text-[11px] text-gray-400 block mb-1">Cut</label>
                  <select
                    className="w-full bg-gray-800 text-white text-xs px-2 py-1.5 rounded border border-gray-600 focus:outline-none focus:border-yellow-500"
                    value={selected.parameters.cut as string ?? 'round-brilliant'}
                    onChange={(e) => updateParam('cut', e.target.value)}
                  >
                    {['round-brilliant', 'emerald', 'princess', 'oval', 'marquise', 'pear'].map((c) => (
                      <option key={c} value={c}>{c.replace(/-/g, ' ').replace(/^\w/, (ch) => ch.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="text-[11px] text-gray-400 block mb-1">Stone Type</label>
                  <select
                    className="w-full bg-gray-800 text-white text-xs px-2 py-1.5 rounded border border-gray-600 focus:outline-none focus:border-yellow-500"
                    value={selected.parameters.gemType as string ?? 'diamond'}
                    onChange={(e) => updateParam('gemType', e.target.value)}
                  >
                    {['diamond', 'emerald', 'ruby', 'sapphire', 'amethyst', 'topaz'].map((g) => (
                      <option key={g} value={g}>{g.replace(/^\w/, (c) => c.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <ParamRow
                  label="Size (mm)"
                  value={selected.parameters.size as number ?? 6}
                  onChange={(v) => updateParam('size', v)}
                  min={0.5} max={15} step={0.1}
                />
                <ParamRow
                  label="Depth (mm)"
                  value={selected.parameters.depth as number ?? 4}
                  onChange={(v) => updateParam('depth', v)}
                  min={0.5} max={12} step={0.1}
                />
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function Section({
  title, id, expanded, onToggle, children,
}: {
  title: string; id: string; expanded: string | null;
  onToggle: (id: string) => void; children: React.ReactNode;
}) {
  const open = expanded === id;
  return (
    <div className="border-b border-gray-700/30">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
      >
        <span className="font-medium uppercase tracking-wider text-[10px]">{title}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-3 pt-1">{children}</div>}
    </div>
  );
}

function XYZRow({ label, values, onChange, step = 0.1, min }: {
  label: string;
  values: [number, number, number];
  onChange: (axis: 0 | 1 | 2, value: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <div>
      <div className="text-[10px] text-gray-500 mb-1">{label}</div>
      <div className="flex gap-1">
        {(['X', 'Y', 'Z'] as const).map((axis, i) => (
          <div key={axis} className="flex-1">
            <div className={`text-[9px] mb-0.5 font-bold ${i === 0 ? 'text-red-400' : i === 1 ? 'text-green-400' : 'text-blue-400'}`}>{axis}</div>
            <input
              type="number"
              step={step}
              min={min}
              value={Number(values[i].toFixed(3))}
              onChange={(e) => onChange(i as 0 | 1 | 2, parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-800 text-white text-xs px-1.5 py-1 rounded border border-gray-600 focus:outline-none focus:border-yellow-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ParamRow({ label, value, onChange, min = 0, max = 100, step = 1 }: {
  label: string; value: number;
  onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
}) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-yellow-400 font-mono">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded accent-yellow-500"
      />
    </div>
  );
}

function EmptyState({ objects, onSelect }: {
  objects: import('../types').SceneObject[];
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="p-4">
      {objects.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <div className="text-3xl mb-2">💍</div>
          <p className="text-xs">No objects in scene</p>
          <p className="text-[10px] mt-1 text-gray-600">Use the toolbar to add rings and gemstones</p>
        </div>
      ) : (
        <>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Scene Objects</div>
          {objects.map((obj) => (
            <button
              key={obj.id}
              onClick={() => onSelect(obj.id)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 text-left mb-1 transition-colors"
            >
              <span className="text-base">{obj.type === 'ring' ? '⭕' : obj.type === 'gemstone' ? '💎' : '🔷'}</span>
              <div>
                <div className="text-xs text-gray-200">{obj.name}</div>
                <div className="text-[10px] text-gray-500">{obj.type}</div>
              </div>
            </button>
          ))}
        </>
      )}
    </div>
  );
}
