import React from 'react';
import { DONATION_STATUSES } from '../../utils/constants';

const StatusBadge = ({ status }) => {
  const info = DONATION_STATUSES[status] || {
    label: status || 'Unknown',
    color: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${info.color}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {info.label}
    </span>
  );
};

export default StatusBadge;
