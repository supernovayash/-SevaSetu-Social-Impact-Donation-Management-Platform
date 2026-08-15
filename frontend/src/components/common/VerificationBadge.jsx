import React from 'react';
import { ShieldCheck, Clock, XCircle } from 'lucide-react';
import { INSTITUTION_STATUSES } from '../../utils/constants';

const VerificationBadge = ({ status }) => {
  if (status === 'VERIFIED') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
        VERIFIED NGO
      </span>
    );
  }

  if (status === 'REJECTED') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
        <XCircle className="w-4 h-4 mr-1 text-rose-600" />
        APPLICATION REJECTED
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
      <Clock className="w-4 h-4 mr-1 text-amber-600" />
      PENDING VERIFICATION
    </span>
  );
};

export default VerificationBadge;
