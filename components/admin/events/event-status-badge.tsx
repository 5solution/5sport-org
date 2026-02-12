'use client';

import { Badge } from '@/components/ui/badge';
import { EventResponseDtoStatus } from '@/lib/schemas/eventResponseDtoStatus';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
  [EventResponseDtoStatus.DRAFT]: { variant: 'secondary', label: 'Draft' },
  [EventResponseDtoStatus.PUBLISHED]: { variant: 'default', label: 'Published' },
  [EventResponseDtoStatus.LIVE]: { variant: 'success', label: 'Live' },
  [EventResponseDtoStatus.CLOSED]: { variant: 'outline', label: 'Closed' },
  [EventResponseDtoStatus.CANCELLED]: { variant: 'destructive', label: 'Cancelled' },
};

export function EventStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { variant: 'outline' as BadgeVariant, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
