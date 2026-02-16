'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { EventResponseDtoStatus } from '@/lib/schemas/eventResponseDtoStatus';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

const statusVariants: Record<string, BadgeVariant> = {
  [EventResponseDtoStatus.DRAFT]: 'secondary',
  [EventResponseDtoStatus.PUBLISHED]: 'default',
  [EventResponseDtoStatus.LIVE]: 'success',
  [EventResponseDtoStatus.CLOSED]: 'outline',
  [EventResponseDtoStatus.CANCELLED]: 'destructive',
};

const statusKeys: Record<string, string> = {
  [EventResponseDtoStatus.DRAFT]: 'draft',
  [EventResponseDtoStatus.PUBLISHED]: 'published',
  [EventResponseDtoStatus.LIVE]: 'live',
  [EventResponseDtoStatus.CLOSED]: 'closed',
  [EventResponseDtoStatus.CANCELLED]: 'cancelled',
};

export function EventStatusBadge({ status }: { status: string }) {
  const t = useTranslations('common.eventStatuses');
  const variant = statusVariants[status] ?? 'outline';
  const key = statusKeys[status];
  const label = key ? t(key) : status;
  return <Badge variant={variant}>{label}</Badge>;
}
