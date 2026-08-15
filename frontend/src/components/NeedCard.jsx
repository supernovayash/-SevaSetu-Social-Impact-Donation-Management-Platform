import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Coins, Utensils, Shirt, BookOpen, Activity, Package, ArrowRight } from 'lucide-react';
import UrgencyBadge from './common/UrgencyBadge';
import ProgressBar from './common/ProgressBar';
import { CATEGORIES } from '../utils/constants';

const categoryIcons = {
  MONEY: Coins,
  FOOD: Utensils,
  CLOTHES: Shirt,
  BOOKS: BookOpen,
  MEDICAL: Activity,
  OTHER: Package,
};

const NeedCard = ({ need }) => {
  const {
    id,
    title,
    description,
    category,
    urgencyLevel,
    quantityRequired = 0,
    quantityFulfilled = 0,
    unit = 'items',
    city,
    institutionName,
    status,
  } = need;

  const remaining = Math.max(0, quantityRequired - quantityFulfilled);
  const percentage = quantityRequired > 0 ? Math.round((quantityFulfilled / quantityRequired) * 100) : 0;
  const CategoryIcon = categoryIcons[category] || Package;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Top Header Strip */}
      <div className="p-5 pb-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
              <CategoryIcon className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {category}
            </span>
          </div>
          <UrgencyBadge level={urgencyLevel} />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 pt-1">
          <div className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[140px]">{institutionName || 'NGO Partner'}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{city || 'Location N/A'}</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mt-auto px-5 py-3 bg-slate-50/70 border-t border-b border-slate-100">
        <ProgressBar fulfilled={quantityFulfilled} required={quantityRequired} unit={unit} />
        <div className="flex justify-between items-center text-xs font-semibold mt-2">
          <span className="text-slate-500">Remaining</span>
          <span className="text-emerald-700 font-bold">
            {remaining} {unit}
          </span>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-4 bg-white">
        <Link
          to={`/needs/${id}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-emerald-600 transition-all duration-200 shadow-md group-hover:shadow-emerald-600/20"
        >
          <span>View Details & Donate</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default NeedCard;
