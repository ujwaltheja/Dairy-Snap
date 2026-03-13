import { useSceneStore } from '../store/sceneStore';
import type { MaterialType } from '../types';
import { Check } from 'lucide-react';

const METALS: { id: MaterialType; label: string; subtitle: string; hex: string; shine: string }[] = [
  { id: 'yellow-gold', label: '18K Yellow Gold', subtitle: '75% Au · 12.5% Ag · 12.5% Cu', hex: '#FFD700', shine: 'from-yellow-300 to-yellow-600' },
  { id: 'white-gold',  label: '18K White Gold',  subtitle: '75% Au · Rhodium plated',       hex: '#E8E8E8', shine: 'from-gray-100 to-gray-400'  },
  { id: 'rose-gold',   label: '18K Rose Gold',   subtitle: '75% Au · 22.5% Cu · 2.5% Ag',  hex: '#E8A090', shine: 'from-rose-300 to-rose-500'   },
  { id: 'silver',      label: 'Sterling Silver', subtitle: '92.5% Ag · 7.5% Cu',            hex: '#C0C0C0', shine: 'from-gray-200 to-gray-500'   },
  { id: 'platinum',    label: 'Platinum',        subtitle: '95% Pt · 5% Ru',                hex: '#E5E4E2', shine: 'from-slate-200 to-slate-400'  },
];

export default function MaterialPanel() {
  const { activeMaterial, setMaterial, selectedId, objects, updateObject } = useSceneStore();

  const applyToSelected = (mat: MaterialType) => {
    setMaterial(mat);
    if (selectedId) updateObject(selectedId, { material: mat });
  };

  return (
    <div className="bg-gray-900 border-b border-gray-700/50 p-3">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Material</div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {METALS.map((m) => (
          <button
            key={m.id}
            title={m.subtitle}
            onClick={() => applyToSelected(m.id)}
            className={`flex flex-col items-center gap-1 shrink-0 p-2 rounded-lg border transition-all ${
              activeMaterial === m.id
                ? 'border-yellow-500/70 bg-yellow-500/10'
                : 'border-gray-700 hover:border-gray-500 bg-gray-800/50'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${m.shine} shadow-lg flex items-center justify-center`}
            >
              {activeMaterial === m.id && <Check size={14} className="text-gray-900" strokeWidth={3} />}
            </div>
            <span className="text-[9px] text-gray-300 text-center w-14 leading-tight">{m.label.replace(/18K /g, '')}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
