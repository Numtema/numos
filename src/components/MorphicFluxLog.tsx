import React, { useEffect, useRef } from 'react';
import { MorphicTrace } from '../types';

interface Props {
  flux: MorphicTrace[];
}

const MorphicFluxLog: React.FC<Props> = ({ flux }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [flux]);

  return (
    <div className="bg-numtema-panel border border-numtema-border rounded-lg p-4 h-full flex flex-col font-mono text-xs overflow-hidden">
      <div className="flex items-center justify-between mb-2 border-b border-numtema-border pb-2">
        <span className="text-numtema-primary font-bold">MORPHIC_FLUX_LOG</span>
        <span className="text-numtema-muted opacity-50">/var/log/morphosys</span>
      </div>
      <div className="overflow-y-auto flex-1 space-y-2 pr-2">
        {flux.length === 0 && (
          <div className="text-numtema-muted opacity-30 italic">No flux activity recorded...</div>
        )}
        {flux.map((trace, idx) => (
          <div key={idx} className="flex gap-2 animate-fadeIn">
             <span className="text-numtema-muted min-w-[24px]">[{String(trace.step).padStart(2, '0')}]</span>
             <span className="text-numtema-secondary font-bold min-w-[80px]">{trace.morphism.toUpperCase()}</span>
             <span className="text-numtema-text flex-1">{trace.description}</span>
             <span className={`min-w-[40px] text-right ${trace.epsilon > 0.5 ? 'text-numtema-accent' : 'text-green-500'}`}>
                ε:{trace.epsilon.toFixed(2)}
             </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default MorphicFluxLog;
