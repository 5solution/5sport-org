'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

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

  const t = useTranslations('admin.events');
  const tButtons = useTranslations('common.buttons');

  const { data, isLoading, error } = useEventControllerFindOne(eventId, {
    query: { enabled: !!eventId },
  });
  const publishMutation = useEventControllerPublish();
  const cancelMutation = useEventControllerCancel();
  const deleteMutation = useEventControllerDelete();

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const event = data as any;
  const validEvent = event && event.id && event.name ? event : null;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getEventControllerFindOneQueryKey(eventId) });
    queryClient.invalidateQueries({ queryKey: getEventControllerFindAllQueryKey() });
  };

  const handleConfirm = async () => {
    try {
      if (confirmAction === 'publish') {
        await publishMutation.mutateAsync({ id: eventId });
        invalidate();
        toast.success('Event published successfully');
      } else if (confirmAction === 'cancel') {
        await cancelMutation.mutateAsync({ id: eventId });
        invalidate();
        toast.success('Event cancelled');
      } else if (confirmAction === 'delete') {
        await deleteMutation.mutateAsync({ id: eventId });
        toast.success('Event deleted');
        router.push('/admin/events');
        return;
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Action failed';
      toast.error(message);
    } finally {
      setConfirmAction(null);
    }
  };

  const isMutating = publishMutation.isPending || cancelMutation.isPending || deleteMutation.isPending;

  const confirmLabels: Record<string, { title: string; description: string; action: string }> = {
    publish: {
      title: t('dialogs.publishTitle'),
      description: t('dialogs.publishDetailDescription'),
      action: t('dialogs.publishAction'),
    },
    cancel: {
      title: t('dialogs.cancelTitle'),
      description: t('dialogs.cancelDetailDescription'),
      action: t('dialogs.cancelAction'),
    },
    delete: {
      title: t('dialogs.deleteTitle'),
      description: t('dialogs.deleteDetailDescription'),
      action: t('dialogs.deleteAction'),
    },
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || (!isLoading && !validEvent)) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-muted-foreground">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Loader2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">{t('detail.eventNotFound')}</p>
          <p className="text-sm">{t('detail.eventNotFoundDescription')}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/admin/events')}>
          {t('detail.backToEvents')}
        </Button>
      </div>
    );
  }

  // Extract nested sub-resources if present
  const sessions = validEvent.sessions ?? [];
  const descriptions = validEvent.descriptions ?? [];

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <EventHeader
        event={validEvent}
        onPublish={() => setConfirmAction('publish')}
        onCancel={() => setConfirmAction('cancel')}
        onDelete={() => setConfirmAction('delete')}
        isLoading={isMutating}
      />

      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">{t('detail.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="sessions">{t('detail.tabs.sessions')}</TabsTrigger>
          <TabsTrigger value="fields">{t('detail.tabs.fields')}</TabsTrigger>
          <TabsTrigger value="descriptions">{t('detail.tabs.descriptions')}</TabsTrigger>
          <TabsTrigger value="scoring">{t('detail.tabs.scoring')}</TabsTrigger>
          <TabsTrigger value="blacklist">{t('detail.tabs.blacklist')}</TabsTrigger>
          <TabsTrigger value="settings">{t('detail.tabs.settings')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <EventOverviewTab event={validEvent} />
        </TabsContent>

        <TabsContent value="sessions">
          <EventSessionsTab eventId={eventId} sessions={sessions} />
        </TabsContent>

        <TabsContent value="fields">
          <EventFieldsTab eventId={eventId} />
        </TabsContent>

        <TabsContent value="descriptions">
          <EventDescriptionsTab eventId={eventId} descriptions={descriptions} />
        </TabsContent>

        <TabsContent value="scoring">
          <EventScoringTab eventId={eventId} sportType={validEvent.sportType} />
        </TabsContent>

        <TabsContent value="blacklist">
          <EventBlacklistTab eventId={eventId} />
        </TabsContent>

        <TabsContent value="settings">
          <EventSettingsTab event={validEvent} />
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
              {tButtons('cancel')}
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
