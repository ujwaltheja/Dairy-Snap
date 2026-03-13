import { useState } from 'react';
import { useSceneStore } from '../store/sceneStore';
import type { GemCut, GemType } from '../types';
import { GEM_DISPLAY } from '../lib/gemPrimitives';
import { X } from 'lucide-react';

const CUTS: { id: GemCut; label: string; shape: string }[] = [
  { id: 'round-brilliant', label: 'Round',    shape: '⬤' },
  { id: 'emerald',         label: 'Emerald',  shape: '▬' },
  { id: 'princess',        label: 'Princess', shape: '◼' },
  { id: 'oval',            label: 'Oval',     shape: '⬬' },
  { id: 'marquise',        label: 'Marquise', shape: '◆' },
  { id: 'pear',            label: 'Pear',     shape: '🫧' },
];

export default function GemstoneLibrary() {
  const { addObject, activeMaterial, setGemLib } = useSceneStore();
  const [selectedGem, setSelectedGem] = useState<GemType>('diamond');
  const [selectedCut, setSelectedCut] = useState<GemCut>('round-brilliant');
  const [size, setSize] = useState(6);

  const addGem = () => {
    addObject({
      id: crypto.randomUUID(),
      name: `${GEM_DISPLAY[selectedGem].label} (${selectedCut.replace(/-/g, ' ')})`,
      type: 'gemstone',
      visible: true,
      locked: false,
      material: activeMaterial,
      parameters: {
        cut: selectedCut,
        gemType: selectedGem,
        size,
        depth: size * 0.65,
        carats: +(size * size * 0.006).toFixed(2),
      },
      position: [0, 0.3, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });
    setGemLib(false);
  };

  return (
    <div className="absolute right-72 top-16 z-50 bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl w-72 p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-white">Gemstone Library</span>
        <button onClick={() => setGemLib(false)} className="text-gray-400 hover:text-white p-0.5 rounded">
          <X size={16} />
        </button>
      </div>

      {/* Stone type grid */}
      <div className="mb-3">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Stone Type</div>
        <div className="grid grid-cols-3 gap-1.5">
          {(Object.entries(GEM_DISPLAY) as [GemType, { label: string; hex: string }][]).map(([id, info]) => (
            <button
              key={id}
              onClick={() => setSelectedGem(id)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs transition-all ${
                selectedGem === id
                  ? 'border-yellow-500/70 bg-yellow-500/10 text-white'
                  : 'border-gray-700 hover:border-gray-500 text-gray-400'
              }`}
            >
              <div
                className="w-6 h-6 rounded-full shadow-md"
                style={{ background: info.hex, boxShadow: `0 0 8px ${info.hex}88` }}
              />
              <span className="text-[10px]">{info.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cut selector */}
      <div className="mb-3">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Cut</div>
        <div className="grid grid-cols-3 gap-1.5">
          {CUTS.map((cut) => (
            <button
              key={cut.id}
              onClick={() => setSelectedCut(cut.id)}
              className={`py-1.5 px-2 rounded-lg border text-xs transition-all flex flex-col items-center gap-0.5 ${
                selectedCut === cut.id
                  ? 'border-yellow-500/70 bg-yellow-500/10 text-white'
                  : 'border-gray-700 hover:border-gray-500 text-gray-400'
              }`}
            >
              <span className="text-base leading-none">{cut.shape}</span>
              <span className="text-[9px]">{cut.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Size slider */}
      <div className="mb-4">
        <div className="flex justify-between text-[11px] mb-1">
          <span className="text-gray-400">Size</span>
          <span className="text-yellow-400 font-mono">{size.toFixed(1)} mm · ~{(size * size * 0.006).toFixed(2)} ct</span>
        </div>
        <input
          type="range" min={0.5} max={12} step={0.1}
          value={size}
          onChange={(e) => setSize(parseFloat(e.target.value))}
          className="w-full accent-yellow-500"
        />
      </div>

      {/* Preview swatch */}
      <div className="flex items-center gap-3 mb-4 bg-gray-800/60 rounded-lg p-3">
        <div
          className="w-12 h-12 rounded-full shadow-xl"
          style={{
            background: GEM_DISPLAY[selectedGem].hex,
            boxShadow: `0 0 20px ${GEM_DISPLAY[selectedGem].hex}88, inset 0 2px 4px rgba(255,255,255,0.4)`,
          }}
        />
        <div>
          <div className="text-sm text-white font-medium">{GEM_DISPLAY[selectedGem].label}</div>
          <div className="text-[11px] text-gray-400">{CUTS.find((c) => c.id === selectedCut)?.label} cut · {size.toFixed(1)} mm</div>
          <div className="text-[10px] text-yellow-400">≈ {(size * size * 0.006).toFixed(2)} carats</div>
        </div>
      </div>

      <button
        onClick={addGem}
        className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold text-sm py-2.5 rounded-lg transition-colors"
      >
        Add to Scene
      </button>
    </div>
  );
}
