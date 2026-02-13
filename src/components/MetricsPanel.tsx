import React from 'react';
import { CognitiveState, CognitiveMode } from '../types';

interface Props {
  state: CognitiveState;
}

const MetricsPanel: React.FC<Props> = ({ state }) => {
  const { metrics, mode } = state;

  const modeColor = {
    [CognitiveMode.EXPLORATION]: 'text-yellow-400',
    [CognitiveMode.STABILIZATION]: 'text-blue-400',
    [CognitiveMode.OPTIMIZATION]: 'text-green-400',
    [CognitiveMode.REVISION]: 'text-red-400',
  }[mode];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-numtema-panel border border-numtema-border p-3 rounded-lg">
        <div className="text-xs text-numtema-muted font-mono uppercase tracking-wider mb-1">System Mode</div>
        <div className={`text-lg font-bold font-mono ${modeColor} uppercase`}>{mode}</div>
      </div>

      <div className="bg-numtema-panel border border-numtema-border p-3 rounded-lg relative overflow-hidden group">
        <div className="text-xs text-numtema-muted font-mono uppercase tracking-wider mb-1">Entropy (H)</div>
        <div className="text-lg font-bold font-mono text-numtema-text">{metrics.entropy.toFixed(3)}</div>
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${(metrics.entropy / 5) * 100}%` }}></div>
      </div>

      <div className="bg-numtema-panel border border-numtema-border p-3 rounded-lg relative overflow-hidden">
        <div className="text-xs text-numtema-muted font-mono uppercase tracking-wider mb-1">Potential (U)</div>
        <div className="text-lg font-bold font-mono text-numtema-text">{metrics.potential.toFixed(3)}</div>
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-500" style={{ width: `${metrics.potential * 100}%` }}></div>
      </div>

      <div className="bg-numtema-panel border border-numtema-border p-3 rounded-lg relative overflow-hidden">
         <div className="flex justify-between items-center mb-1">
            <div className="text-xs text-numtema-muted font-mono uppercase tracking-wider">Pred. Error (ε)</div>
            <div className="text-[10px] text-numtema-accent font-mono">{metrics.prediction_error > 0.5 ? 'HIGH' : 'NOMINAL'}</div>
         </div>
        <div className="text-lg font-bold font-mono text-numtema-text">{metrics.prediction_error.toFixed(3)}</div>
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-numtema-accent to-red-800 transition-all duration-500" style={{ width: `${metrics.prediction_error * 100}%` }}></div>
      </div>
    </div>
  );
};

export default MetricsPanel;
