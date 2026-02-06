import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface MaskedDataProps {
  data: string;
  visibleCount?: number; // How many chars to show at end
  className?: string;
}

export const MaskedData: React.FC<MaskedDataProps> = ({ data, visibleCount = 4, className = "" }) => {
  const [revealed, setRevealed] = useState(false);

  const toggleReveal = () => setRevealed(!revealed);

  const maskedValue = data.length > visibleCount 
    ? '*'.repeat(data.length - visibleCount) + data.slice(-visibleCount)
    : data;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-mono text-sm tracking-wider">
        {revealed ? data : maskedValue}
      </span>
      <button 
        onClick={toggleReveal}
        className="text-slate-400 hover:text-navy-900 transition-colors p-1"
        aria-label={revealed ? "Hide sensitive data" : "Reveal sensitive data"}
      >
        {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
};