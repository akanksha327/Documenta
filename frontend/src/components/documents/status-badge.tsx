import React from 'react';

interface StatusBadgeProps {
  status: 'Draft' | 'Pending' | 'Signed' | 'Rejected';
}

const statusStyles = {
  Draft: 'bg-blue-50 text-blue-700 border-blue-200/60',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
  Signed: 'bg-green-50 text-green-700 border-green-200/60',
  Rejected: 'bg-red-50 text-red-700 border-red-200/60',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
        statusStyles[status] || statusStyles.Draft
      }`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          status === 'Draft'
            ? 'bg-blue-500'
            : status === 'Pending'
            ? 'bg-amber-500'
            : status === 'Signed'
            ? 'bg-green-500'
            : 'bg-red-500'
        }`}
      />
      {status}
    </span>
  );
}
