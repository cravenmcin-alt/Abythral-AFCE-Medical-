
import React from 'react';
import { PatientState, ConstraintDomain, DomainMetric } from '../types';

interface Props {
  patient: PatientState;
  onUpdate: (updates: Partial<PatientState>) => void;
}

const DEVICE_MAP: Record<ConstraintDomain, string> = {
  [ConstraintDomain.Cellular]: 'Single-cell RNAseq / ctDNA',
  [ConstraintDomain.Immune]: 'Flow Cytometry / Cytokine Panels',
  [ConstraintDomain.Metabolic]: 'PET Scan / CGM / Lactate',
  [ConstraintDomain.Vascular]: 'fMRI / Doppler / Elasticity',
  [ConstraintDomain.Epigenetic]: 'RNAseq / Methylation Assay',
  [ConstraintDomain.Neural]: 'HRV / Neuro-Immune Monitor'
};

const DeviceFeedPanel: React.FC<Props> = ({ patient, onUpdate }) => {
  const handleDomainChange = (domain: ConstraintDomain, key: keyof DomainMetric, val: number) => {
    const nextDomains = patient.domains.map(d => {
      if (d.domain === domain) {
        return { ...d, [key]: val };
      }
      return d;
    });
    onUpdate({ domains: nextDomains });
  };

  return (
    <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <i className="fa-solid fa-microchip text-rose-400"></i>
          Device Feed
        </h2>
        <span className="text-[10px] text-slate-500 font-mono">LINKED_DEVICES: 6</span>
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {patient.domains.map(d => (
          <div key={d.domain} className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">{d.domain}</span>
              <span className="text-[8px] text-cyan-500/70 font-mono uppercase">{DEVICE_MAP[d.domain]}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Flexibility (%)</label>
                <input 
                  type="number" 
                  value={d.flexibility}
                  onChange={(e) => handleDomainChange(d.domain, 'flexibility', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-cyan-400 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase font-bold">Rigidity (%)</label>
                <input 
                  type="number" 
                  value={d.rigidity}
                  onChange={(e) => handleDomainChange(d.domain, 'rigidity', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-rose-400 font-mono"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Systemic Indices</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 uppercase font-bold">Variability (0-1)</label>
              <input 
                type="number" 
                step="0.01"
                value={patient.variabilityIndex}
                onChange={(e) => onUpdate({ variabilityIndex: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-slate-200 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 uppercase font-bold">State Volume (0-1)</label>
              <input 
                type="number" 
                step="0.01"
                value={patient.stateSpaceVolume}
                onChange={(e) => onUpdate({ stateSpaceVolume: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceFeedPanel;
