interface StatusBadgeProps {
  status: string;
  type?: 'criminal' | 'fir' | 'case';
}

export function StatusBadge({ status, type = 'criminal' }: StatusBadgeProps) {
  const map: Record<string, string> = {
    'Wanted': 'status-wanted',
    'Arrested': 'status-arrested',
    'Released': 'status-released',
    'Under Trial': 'status-under-trial',
    'Open': 'status-open',
    'Under Investigation': 'status-investigation',
    'Closed': 'status-closed',
    'Active': 'status-active',
    'Pending': 'status-pending',
    'Dismissed': 'status-dismissed',
  };
  const cls = map[status] ?? 'status-closed';
  return <span className={cls}>{status}</span>;
}

export function EvidenceBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    'Photo': 'evidence-photo',
    'Video': 'evidence-video',
    'Document': 'evidence-document',
    'Weapon': 'evidence-weapon',
  };
  const cls = map[type] ?? 'evidence-document';
  return <span className={cls}>{type}</span>;
}
