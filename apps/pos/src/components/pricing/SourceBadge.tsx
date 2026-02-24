import React from 'react';

export default function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    manual: 'bg-neutral-700 text-neutral-300',
    ai_suggestion: 'bg-purple-900/40 text-purple-400',
    scheduled_rule: 'bg-blue-900/40 text-blue-400',
    ab_test: 'bg-green-900/40 text-green-400',
    delivery_sync: 'bg-amber-900/40 text-amber-400',
    revert: 'bg-red-900/40 text-red-400',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[source] || colors.manual}`}>
      {source.replace('_', ' ')}
    </span>
  );
}
