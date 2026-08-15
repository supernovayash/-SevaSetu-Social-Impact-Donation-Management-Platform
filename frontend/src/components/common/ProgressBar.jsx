import React from 'react';

const ProgressBar = ({ fulfilled = 0, required = 100, unit = 'units' }) => {
  const percentage = Math.min(100, Math.round((fulfilled / Math.max(1, required)) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
        <span>
          <strong className="text-slate-900 font-bold">{fulfilled}</strong> / {required} {unit} fulfilled
        </span>
        <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-mono font-bold">
          {percentage}%
        </span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            percentage >= 100
              ? 'bg-emerald-500'
              : percentage > 50
              ? 'bg-teal-500'
              : 'bg-indigo-500'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
