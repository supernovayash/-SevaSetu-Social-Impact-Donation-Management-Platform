import React from 'react';
import { Heart, Coins, Package, Building2, Calendar, ArrowUpRight, CreditCard } from 'lucide-react';
import StatusBadge from './common/StatusBadge';

const DonationCard = ({ donation, onTrack, onPay, onCancel }) => {
  const {
    id,
    type,
    amount,
    quantity,
    unit = 'units',
    category,
    description,
    institutionName,
    needTitle,
    status,
    createdAt,
  } = donation;

  const isMoney = type === 'MONEY';
  const isPledged = status === 'PLEDGED';
  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : 'Recently';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all p-5 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 ${
              isMoney ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {isMoney ? <Coins className="w-4 h-4" /> : <Package className="w-4 h-4" />}
              {type}
            </span>
            <span className="text-xs font-semibold text-slate-400">#DON-{id}</span>
          </div>
          <StatusBadge status={status} />
        </div>

        <div>
          <div className="text-xl font-extrabold text-slate-900">
            {isMoney ? `₹${amount?.toLocaleString('en-IN') || amount || 0}` : `${quantity || 0} ${unit}`}
          </div>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">
            {needTitle ? `Target: ${needTitle}` : description || (category ? `Open ${category} Donation` : 'General Contribution')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{institutionName || 'Open Donation (Unassigned)'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onTrack(id)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <span>Track Timeline</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        {isPledged && isMoney && onPay && (
          <button
            onClick={() => onPay(id)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay Now</span>
          </button>
        )}

        {isPledged && onCancel && (
          <button
            onClick={() => onCancel(id)}
            className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            title="Cancel this pledged donation"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default DonationCard;
