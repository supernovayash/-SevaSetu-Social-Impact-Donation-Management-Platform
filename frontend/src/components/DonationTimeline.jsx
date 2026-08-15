import React from 'react';
import { Check, Clock, User, FileText, AlertCircle, Sparkles } from 'lucide-react';

const STAGE_ORDER = ['PLEDGED', 'CONFIRMED', 'PICKED_UP', 'DELIVERED', 'UTILIZED'];

const STAGE_LABELS = {
  PLEDGED: { title: 'Donation Pledged', desc: 'Donor committed contribution' },
  CONFIRMED: { title: 'Payment / Donation Confirmed', desc: 'Verified and ready for logistics' },
  PICKED_UP: { title: 'Picked Up by Volunteer', desc: 'In transit to institution' },
  DELIVERED: { title: 'Delivered to Institution', desc: 'Received at destination' },
  UTILIZED: { title: 'Proof of Impact Submitted', desc: 'Fully utilized for beneficiaries' },
};

const DonationTimeline = ({ events = [], currentStatus = 'PLEDGED', proofDetails = null }) => {
  // Map recorded events by status
  const eventMap = events.reduce((acc, ev) => {
    acc[ev.status] = ev;
    return acc;
  }, {});

  const currentIdx = STAGE_ORDER.indexOf(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Donation Lifecycle Timeline
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time status tracking and verification audit log</p>
        </div>
        {isCancelled && (
          <span className="px-3 py-1 bg-rose-100 text-rose-800 font-bold text-xs rounded-full border border-rose-300">
            Cancelled
          </span>
        )}
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {STAGE_ORDER.map((stage, idx) => {
          const recorded = eventMap[stage];
          const isDone = idx <= currentIdx && !isCancelled;
          const isCurrent = idx === currentIdx && !isCancelled;
          const labelInfo = STAGE_LABELS[stage];

          return (
            <div key={stage} className="relative group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-[31px] top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isDone
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-amber-500 border-amber-500 text-white animate-pulse-subtle ring-4 ring-amber-50'
                    : 'bg-white border-slate-300 text-slate-300'
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Clock className="w-3.5 h-3.5" />}
              </div>

              {/* Event Content */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4
                    className={`text-sm font-bold ${
                      isDone ? 'text-slate-900' : isCurrent ? 'text-amber-700' : 'text-slate-400'
                    }`}
                  >
                    {labelInfo.title}
                  </h4>

                  {recorded?.timestamp && (
                    <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                      {new Date(recorded.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500">{labelInfo.desc}</p>

                {/* Actor & Notes details */}
                {recorded && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    {recorded.actorName && (
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{recorded.actorName}</span>
                        {recorded.actorRole && (
                          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            {recorded.actorRole}
                          </span>
                        )}
                      </div>
                    )}
                    {recorded.note && (
                      <div className="flex items-start gap-1.5 text-slate-600 italic pt-0.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>"{recorded.note}"</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Proof of impact highlight card if stage is UTILIZED and proof exists */}
                {stage === 'UTILIZED' && isDone && proofDetails && (
                  <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      Proof of Impact Submitted
                    </div>
                    {proofDetails.description && (
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {proofDetails.description}
                      </p>
                    )}
                    {proofDetails.imageUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-emerald-200 max-w-sm">
                        <img
                          src={proofDetails.imageUrl}
                          alt="Proof of Impact"
                          className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DonationTimeline;
