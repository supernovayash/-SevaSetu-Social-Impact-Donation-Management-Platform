import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-6 w-24 bg-slate-200 rounded-md"></div>
      <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
    </div>
    <div className="h-5 w-3/4 bg-slate-200 rounded-md"></div>
    <div className="h-4 w-full bg-slate-100 rounded-md"></div>
    <div className="h-4 w-1/2 bg-slate-100 rounded-md"></div>
    <div className="h-3 w-full bg-slate-200 rounded-full pt-2"></div>
    <div className="h-9 w-full bg-slate-200 rounded-xl mt-4"></div>
  </div>
);

export const GridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const TableSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex justify-between items-center p-3 border-b border-slate-100">
        <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
        <div className="h-4 w-1/6 bg-slate-200 rounded"></div>
        <div className="h-4 w-1/5 bg-slate-200 rounded"></div>
        <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
      </div>
    ))}
  </div>
);

export default CardSkeleton;
