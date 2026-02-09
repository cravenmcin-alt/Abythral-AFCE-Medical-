
import React, { useState } from 'react';
import { ConstraintDomain, PatientState, AssessmentResult, DomainMetric, ChatMessage, MedicalImage } from './types';
import { COLORS, DOMAIN_DESCRIPTIONS } from './constants';
import ConstraintRadar from './components/ConstraintRadar';
import StateSpaceGeometry from './components/StateSpaceGeometry';
import ChatInterface from './components/ChatInterface';
import DeviceFeedPanel from './components/DeviceFeedPanel';
import MedicalScanner from './components/MedicalScanner';
import { analyzeConstraints } from './services/geminiService';

const INITIAL_DOMAINS: DomainMetric[] = Object.values(ConstraintDomain).map(d => ({
  domain: d as ConstraintDomain,
  flexibility: 70 + Math.random() * 20,
  rigidity: 10 + Math.random() * 10,
  collapseRisk: 5 + Math.random() * 5,
  currentValue: 80,
  deviceSource: "SIM_GEN_01"
}));

const App: React.FC = () => {
  const [patient, setPatient] = useState<PatientState>({
    id: 'PX-9921-AFCE',
    name: 'John Doe',
    age: 54,
    lastAssessment: new Date().toLocaleDateString(),
    domains: INITIAL_DOMAINS,
    recoveryHalfLife: 42,
    stateSpaceVolume: 0.85,
    variabilityIndex: 0.78,
    chatHistory: []
  });

  const [activeImage, setActiveImage] = useState<MedicalImage | null>(null);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [perturbing, setPerturbing] = useState<string | null>(null);
  const [view, setView] = useState<'analysis' | 'chat'>('analysis');

  const updatePatient = (updates: Partial<PatientState>) => {
    setPatient(prev => ({ ...prev, ...updates }));
  };

  const addChatMessage = (msg: ChatMessage) => {
    setPatient(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, msg]
    }));
  };

  const handleAnalysis = async () => {
    setAnalyzing(true);
    setView('analysis');
    try {
      const result = await analyzeConstraints(patient, activeImage || undefined);
      setAssessment(result);
    } catch (err) {
      alert("Analysis failed. Please check your API key environment variable.");
    } finally {
      setAnalyzing(false);
    }
  };

  const runPerturbation = (name: string) => {
    setPerturbing(name);
    setTimeout(() => {
      setPatient(prev => ({
        ...prev,
        variabilityIndex: prev.variabilityIndex * 0.8,
        recoveryHalfLife: prev.recoveryHalfLife * 1.5,
        domains: prev.domains.map(d => ({
          ...d,
          flexibility: d.flexibility * 0.9,
          rigidity: d.rigidity * 1.2
        }))
      }));
      setPerturbing(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
            Abythral Medical Engine <span className="text-slate-500 text-lg font-normal">AFCE-M</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Universal Systems Biology & Multi-Modal State-Space Grounding
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-8">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Engine Status</div>
              <div className="text-xs text-emerald-400 font-mono">MULTI_MODAL_ACTIVE</div>
            </div>
            <div className="text-right border-l border-slate-700 pl-6">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Scope</div>
              <div className="text-xs text-cyan-400 font-mono">VISUAL_GROUNDING_SYNC</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-xl border border-slate-700">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Subject</div>
              <div className="text-sm font-mono text-cyan-400 leading-none">{patient.id}</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
              <i className="fa-solid fa-user-doctor text-slate-400 text-xs"></i>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Data Input & System State */}
        <div className="lg:col-span-3 space-y-6">
          <DeviceFeedPanel patient={patient} onUpdate={updatePatient} />
          
          <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <i className="fa-solid fa-microscope text-cyan-400"></i>
              Grounding Scanner
            </h2>
            <MedicalScanner onImageSelected={setActiveImage} />
          </div>

          <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <i className="fa-solid fa-vial-circle-check text-rose-400"></i>
              Systemic Perturbation
            </h2>
            <div className="space-y-2">
              {[
                { name: 'Metabolic Challenge', icon: 'fa-gauge-high' },
                { name: 'Immune Trigger', icon: 'fa-shield-virus' },
                { name: 'Neural Adaptation', icon: 'fa-brain' }
              ].map(test => (
                <button
                  key={test.name}
                  onClick={() => runPerturbation(test.name)}
                  disabled={perturbing !== null}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    perturbing === test.name 
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' 
                    : 'bg-slate-900/40 border-slate-700 hover:border-slate-500 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 text-xs">
                    <i className={`fa-solid ${test.icon}`}></i>
                    {test.name}
                  </div>
                  {perturbing === test.name && <i className="fa-solid fa-spinner fa-spin text-xs"></i>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: Visualizations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <ConstraintRadar data={patient.domains} />
            <div className="grid grid-cols-2 gap-6">
              <StateSpaceGeometry variability={patient.variabilityIndex} collapseFactor={1 - patient.stateSpaceVolume} />
              <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-400 mb-4">
                    Recovery Dynamics
                  </h3>
                  <div className="text-3xl font-mono text-slate-200">{patient.recoveryHalfLife}s</div>
                  <div className="text-[10px] text-slate-500 mt-1 italic">HOMEOTIC_RECOUP_TIME</div>
                </div>
                <div className="space-y-2 mt-8">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>SYSTEM_STABILITY</span>
                    <span>{(patient.variabilityIndex * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500" style={{ width: `${patient.variabilityIndex * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <i className="fa-solid fa-layer-group text-cyan-400 text-sm"></i>
              Systemic Plasticity
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {patient.domains.map(d => (
                <div key={d.domain} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-slate-400">{d.domain}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{d.flexibility}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500/60" 
                      style={{ width: `${d.flexibility}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Chat */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-slate-800/40 rounded-2xl border border-slate-700 flex flex-col h-[850px]">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex gap-4">
                <button 
                  onClick={() => setView('analysis')}
                  className={`text-xs font-bold uppercase tracking-wider pb-2 transition-all ${view === 'analysis' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
                >
                  Health Assessment
                </button>
                <button 
                  onClick={() => setView('chat')}
                  className={`text-xs font-bold uppercase tracking-wider pb-2 transition-all ${view === 'chat' ? 'text-violet-400 border-b-2 border-violet-400' : 'text-slate-500'}`}
                >
                  Clinical Sync
                </button>
              </div>
              <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></div>
            </div>

            <div className="flex-1 overflow-hidden">
              {view === 'analysis' ? (
                <div className="p-6 h-full flex flex-col">
                  {!assessment && !analyzing && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-700">
                        <i className={`fa-solid ${activeImage ? 'fa-eye text-cyan-500 animate-pulse' : 'fa-heart-pulse'} text-2xl`}></i>
                      </div>
                      <p className="text-sm text-slate-500 max-w-[200px]">
                        {activeImage 
                          ? "Visual evidence detected. Ingesting grounding data..." 
                          : "Reconstruct global biological geometry to evaluate systemic health."}
                      </p>
                      <button 
                        onClick={handleAnalysis}
                        className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                          activeImage 
                          ? 'bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                          : 'bg-cyan-600 hover:bg-cyan-500'
                        } text-white`}
                      >
                        {activeImage ? "Multi-Modal Assessment" : "Global Assessment"}
                      </button>
                    </div>
                  )}

                  {analyzing && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="relative">
                         <i className="fa-solid fa-circle-notch fa-spin text-3xl text-cyan-500"></i>
                         {activeImage && <i className="fa-solid fa-image absolute -top-1 -right-1 text-[8px] text-violet-400"></i>}
                      </div>
                      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                        {activeImage ? "Ingesting_Visual_State_Space..." : "Integrating_Human_Systems..."}
                      </p>
                    </div>
                  )}

                  {assessment && !analyzing && (
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Homeostatic Summary</h3>
                        <p className="text-[11px] text-slate-300 leading-relaxed italic">"{assessment.summary}"</p>
                      </div>

                      {assessment.visualGrounding && (
                        <div className="bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/20">
                          <h3 className="text-[10px] font-bold text-cyan-500 uppercase mb-2 flex items-center gap-2">
                            <i className="fa-solid fa-eye"></i> Visual Grounding Report
                          </h3>
                          <p className="text-[10px] text-slate-300 leading-relaxed">{assessment.visualGrounding}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase">Systemic Risk Matrix</h3>
                        {assessment.risks.map((risk, i) => (
                          <div key={i} className={`p-3 rounded-lg border flex items-start gap-3 ${
                            risk.level === 'Critical' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-slate-900/40 border-slate-800'
                          }`}>
                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                              risk.level === 'Critical' ? 'bg-rose-500' : 'bg-amber-500'
                            }`}></div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-200">{risk.domain}</span>
                                <span className={`text-[8px] px-1 rounded font-bold ${
                                  risk.level === 'Critical' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-400'
                                }`}>{risk.level}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1">{risk.finding}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase">Optimization Path</h3>
                        <div className="space-y-1.5">
                          {assessment.interventions.map((item, i) => (
                            <div key={i} className="flex gap-2 p-2 bg-violet-500/5 rounded border border-violet-500/10 text-[10px] text-slate-300">
                              <i className="fa-solid fa-chart-line text-violet-400 mt-0.5"></i>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={() => { setAssessment(null); setActiveImage(null); }}
                        className="w-full py-2 bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-500 uppercase hover:text-slate-300"
                      >
                        Reset Engine
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full p-4">
                  <ChatInterface patient={patient} onNewMessage={addChatMessage} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
