export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  INSTITUTION_ADMIN: 'INSTITUTION_ADMIN',
  DONOR: 'DONOR',
  VOLUNTEER: 'VOLUNTEER',
};

export const CATEGORIES = [
  { id: 'MONEY', label: 'Money / Funds', icon: 'Coins', color: 'emerald' },
  { id: 'FOOD', label: 'Food & Meals', icon: 'Utensils', color: 'amber' },
  { id: 'CLOTHES', label: 'Clothes & Apparel', icon: 'Shirt', color: 'blue' },
  { id: 'BOOKS', label: 'Books & Education', icon: 'BookOpen', color: 'indigo' },
  { id: 'MEDICAL', label: 'Medical Supplies', icon: 'Activity', color: 'rose' },
  { id: 'OTHER', label: 'Other Essentials', icon: 'Package', color: 'purple' },
];

export const URGENCY_LEVELS = [
  { id: 'CRITICAL', label: 'Critical', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'MODERATE', label: 'Moderate', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'LOW', label: 'Low', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export const DONATION_STATUSES = {
  PLEDGED: { label: 'Pledged', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  ASSIGNED: { label: 'Assigned', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  PICKED_UP: { label: 'Picked Up', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  DELIVERED: { label: 'Delivered', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  UTILIZED: { label: 'Utilized / Proof Submitted', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-300' },
};

export const INSTITUTION_STATUSES = {
  PENDING: { label: 'Pending Verification', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  VERIFIED: { label: 'Verified Institution', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  REJECTED: { label: 'Application Rejected', color: 'bg-rose-100 text-rose-800 border-rose-300' },
};
