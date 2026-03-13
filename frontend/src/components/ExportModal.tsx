import { useState } from 'react';
import { useSceneStore } from '../store/sceneStore';
import type { ExportFormat } from '../types';
import { X, Download, FileCode, Layers, Package } from 'lucide-react';
import axios from 'axios';

const FORMATS: { id: ExportFormat; label: string; desc: string; icon: React.ReactNode; ext: string }[] = [
  { id: 'stl',  label: 'STL',  desc: 'Standard Triangulation Language — for 3D printing & CAM',   icon: <Layers size={18} />,   ext: '.stl'  },
  { id: 'obj',  label: 'OBJ',  desc: 'Wavefront OBJ — universal mesh format with materials',       icon: <FileCode size={18} />, ext: '.obj'  },
  { id: 'gltf', label: 'glTF', desc: 'GL Transmission Format — for web/AR with full PBR materials', icon: <Package size={18} />,  ext: '.gltf' },
];

export default function ExportModal() {
  const { objects, setExportOpen } = useSceneStore();
  const [format, setFormat] = useState<ExportFormat>('stl');
  const [scale, setScale] = useState(1.0);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Try backend export endpoint
      const response = await axios.post(
        '/api/export',
        { format, scale, objects },
        { responseType: 'blob', headers: { Authorization: `Bearer ${localStorage.getItem('ai3design_token') ?? 'mock'}` } }
      );
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jewelry-design.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Mock: export scene as JSON with chosen format metadata
      const data = JSON.stringify({ format, scale, exportedAt: new Date().toISOString(), objects }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jewelry-design-mock.${format}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-[480px] p-6 select-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-green-400" />
            <span className="text-base font-semibold text-white">Export Design</span>
          </div>
          <button onClick={() => setExportOpen(false)} className="text-gray-400 hover:text-white p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Format selection */}
        <div className="mb-5">
          <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Format</div>
          <div className="space-y-2">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  format === f.id
                    ? 'border-green-500/70 bg-green-500/10'
                    : 'border-gray-700 hover:border-gray-500 bg-gray-800/40'
                }`}
              >
                <div className={`p-2 rounded-lg ${format === f.id ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                  {f.icon}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{f.label} <span className="text-gray-500 font-normal text-xs">{f.ext}</span></div>
                  <div className="text-[11px] text-gray-400">{f.desc}</div>
                </div>
                {format === f.id && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-green-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Scale */}
        <div className="mb-5">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-gray-400 uppercase tracking-wider">Scale Factor</span>
            <span className="text-green-400 font-mono">{scale.toFixed(2)}×</span>
          </div>
          <input
            type="range" min={0.1} max={5} step={0.05}
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-[9px] text-gray-600 mt-0.5">
            <span>0.1×</span><span>1× (default)</span><span>5×</span>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-800/60 rounded-xl p-3 mb-5 text-[11px] text-gray-400 flex items-center justify-between">
          <span>{objects.length} object{objects.length !== 1 ? 's' : ''} · {format.toUpperCase()} · {scale.toFixed(2)}× scale</span>
          {done && <span className="text-green-400 font-medium">✅ Exported!</span>}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setExportOpen(false)}
            className="flex-1 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Exporting…
              </>
            ) : (
              <>
                <Download size={15} />
                Export {format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
