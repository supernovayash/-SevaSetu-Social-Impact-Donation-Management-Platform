import React from 'react';
import { Inbox, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data found',
  description = 'There are no items to display at this moment.',
  actionLink,
  actionText,
  onAction,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto my-8 shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xs">{description}</p>
      </div>

      {actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>{actionText || 'Get Started'}</span>
        </Link>
      )}

      {onAction && !actionLink && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>{actionText || 'Perform Action'}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
