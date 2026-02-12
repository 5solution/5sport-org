'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Send, XCircle, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EventStatusBadge } from '@/components/admin/events/event-status-badge';
import { EventResponseDtoStatus } from '@/lib/schemas/eventResponseDtoStatus';
import type { EventResponseDto } from '@/lib/schemas/eventResponseDto';

interface EventHeaderProps {
  event: EventResponseDto;
  onPublish: () => void;
  onCancel: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

const sportLabels: Record<string, string> = {
  PICKLEBALL: 'Pickleball',
  BADMINTON: 'Badminton',
};

export function EventHeader({ event, onPublish, onCancel, onDelete, isLoading }: EventHeaderProps) {
  const router = useRouter();
  const isDraft = event.status === EventResponseDtoStatus.DRAFT;
  const isPublishedOrLive =
    event.status === EventResponseDtoStatus.PUBLISHED ||
    event.status === EventResponseDtoStatus.LIVE;

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={() => router.push('/admin/events')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Button>

      {/* Header Content */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
              {event.name}
            </h1>
            <EventStatusBadge status={event.status} />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{sportLabels[event.sportType] ?? event.sportType}</Badge>
            {event.brand && <span>by {event.brand}</span>}
            <span>
              Created{' '}
              {new Date(event.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isDraft && (
            <Button onClick={onPublish} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Publish
            </Button>
          )}
          {isPublishedOrLive && (
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Event
            </Button>
          )}
          {isDraft && (
            <Button variant="destructive" size="icon" onClick={onDelete} disabled={isLoading}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
