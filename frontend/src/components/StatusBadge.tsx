import { Badge } from '@/components/ui/badge';

const cfg: Record<string, { label: string; cls: string }> = {
  confirmed: { label: 'Confirmed', cls: 'bg-green-50 text-green-700 border-green-200' },
  approved: { label: 'Approved', cls: 'bg-green-50 text-green-700 border-green-200' },
  pending: { label: 'Pending', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-700 border-red-200' },
  attended: { label: 'Attended', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  draft: { label: 'Draft', cls: 'bg-gray-50 text-gray-600 border-gray-200' },
  contacted: { label: 'Contacted', cls: 'bg-gray-50 text-gray-600 border-gray-200' },
  negotiating: { label: 'Negotiating', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  received: { label: 'Received', cls: 'bg-green-50 text-green-700 border-green-200' },
};

export function StatusBadge({ status }: { status: string }) {
  const c = cfg[status] || { label: status, cls: 'bg-gray-50 text-gray-600 border-gray-200' };
  return <Badge variant="outline" className={c.cls}>{c.label}</Badge>;
}

export function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    technical: 'bg-blue-50 text-blue-700 border-blue-200',
    cultural: 'bg-pink-50 text-pink-700 border-pink-200',
    sports: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    other: 'bg-gray-50 text-gray-600 border-gray-200',
  };
  return <Badge variant="outline" className={colors[category] || colors.other}>{category}</Badge>;
}
