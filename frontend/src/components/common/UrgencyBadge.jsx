import React from 'react';
import { AlertCircle, Clock, ShieldCheck } from 'lucide-react';

const UrgencyBadge = ({ level }) => {
  if (level === 'CRITICAL') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs animate-pulse-subtle">
        <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
        CRITICAL URGENCY
      </span>
    );
  }

  if (level === 'MODERATE') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
        MODERATE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-slate-500" />
      STANDARD
    </span>
  );
};

export default UrgencyBadge;
