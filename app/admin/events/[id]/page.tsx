'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EventHeader } from '@/components/admin/events/detail/event-header';
import { EventOverviewTab } from '@/components/admin/events/detail/event-overview-tab';
import { EventSessionsTab } from '@/components/admin/events/detail/event-sessions-tab';
import { EventFieldsTab } from '@/components/admin/events/detail/event-fields-tab';
import { EventDescriptionsTab } from '@/components/admin/events/detail/event-descriptions-tab';
import { EventScoringTab } from '@/components/admin/events/detail/event-scoring-tab';
import { EventBlacklistTab } from '@/components/admin/events/detail/event-blacklist-tab';
import { EventSettingsTab } from '@/components/admin/events/detail/event-settings-tab';
import {
  useEventControllerFindOne,
  useEventControllerPublish,
  useEventControllerCancel,
  useEventControllerDelete,
  getEventControllerFindOneQueryKey,
  getEventControllerFindAllQueryKey,
} from '@/lib/services/events/events';

type ConfirmAction = 'publish' | 'cancel' | 'delete' | null;

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const eventId = params?.id as string;

  const { data, isLoading, error } = useEventControllerFindOne(eventId);
  const publishMutation = useEventControllerPublish();
  const cancelMutation = useEventControllerCancel();
  const deleteMutation = useEventControllerDelete();

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  // Access the event from the response - handle both Orval wrapper shapes
  const event = (data as any)?.data?.data ?? (data as any)?.data ?? null;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getEventControllerFindOneQueryKey(eventId) });
    queryClient.invalidateQueries({ queryKey: getEventControllerFindAllQueryKey() });
  };

  const handleConfirm = async () => {
    try {
      if (confirmAction === 'publish') {
        await publishMutation.mutateAsync({ id: eventId });
        invalidate();
      } else if (confirmAction === 'cancel') {
        await cancelMutation.mutateAsync({ id: eventId });
        invalidate();
      } else if (confirmAction === 'delete') {
        await deleteMutation.mutateAsync({ id: eventId });
        router.push('/admin/events');
        return;
      }
    } finally {
      setConfirmAction(null);
    }
  };

  const isMutating = publishMutation.isPending || cancelMutation.isPending || deleteMutation.isPending;

  const confirmLabels: Record<string, { title: string; description: string; action: string }> = {
    publish: {
      title: 'Publish Event',
      description: 'This will make the event visible to participants. Make sure all details are configured correctly.',
      action: 'Publish',
    },
    cancel: {
      title: 'Cancel Event',
      description: 'This will cancel the event. Participants will be notified. This cannot be undone.',
      action: 'Cancel Event',
    },
    delete: {
      title: 'Delete Event',
      description: 'This will permanently delete the event and all its data. This cannot be undone.',
      action: 'Delete',
    },
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>Failed to load event details.</p>
        <Button variant="outline" onClick={() => router.push('/admin/events')}>
          Back to Events
        </Button>
      </div>
    );
  }

  // Extract nested sub-resources if present
  const sessions = event.sessions ?? [];
  const descriptions = event.descriptions ?? [];
  const customFields = event.customFields ?? event.fields ?? [];

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <EventHeader
        event={event}
        onPublish={() => setConfirmAction('publish')}
        onCancel={() => setConfirmAction('cancel')}
        onDelete={() => setConfirmAction('delete')}
        isLoading={isMutating}
      />

      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="descriptions">Descriptions</TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="blacklist">Blacklist</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <EventOverviewTab event={event} />
        </TabsContent>

        <TabsContent value="sessions">
          <EventSessionsTab eventId={eventId} sessions={sessions} />
        </TabsContent>

        <TabsContent value="fields">
          <EventFieldsTab eventId={eventId} fields={customFields} />
        </TabsContent>

        <TabsContent value="descriptions">
          <EventDescriptionsTab eventId={eventId} descriptions={descriptions} />
        </TabsContent>

        <TabsContent value="scoring">
          <EventScoringTab eventId={eventId} sportType={event.sportType} />
        </TabsContent>

        <TabsContent value="blacklist">
          <EventBlacklistTab eventId={eventId} />
        </TabsContent>

        <TabsContent value="settings">
          <EventSettingsTab event={event} />
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction && confirmLabels[confirmAction].title}
            </DialogTitle>
            <DialogDescription>
              {confirmAction && confirmLabels[confirmAction].description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={isMutating}>
              Cancel
            </Button>
            <Button
              variant={confirmAction === 'delete' || confirmAction === 'cancel' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={isMutating}
            >
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmAction && confirmLabels[confirmAction].action}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
