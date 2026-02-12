'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar, Loader2, Plus } from 'lucide-react';

import { useEventsColumns } from '@/components/admin/events/events-columns';
import { EventStatusBadge } from '@/components/admin/events/event-status-badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useEventControllerFindAll,
  useEventControllerDelete,
  useEventControllerPublish,
  useEventControllerCancel,
  getEventControllerFindAllQueryKey,
} from '@/lib/services/events/events';
import { EventResponseDtoStatus } from '@/lib/schemas/eventResponseDtoStatus';
import type { EventResponseDto } from '@/lib/schemas/eventResponseDto';

type ConfirmAction = {
  type: 'publish' | 'cancel' | 'delete';
  id: string;
} | null;

export default function EventsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const { data, isLoading, error } = useEventControllerFindAll({ page: 1, limit: 100 });

  const publishMutation = useEventControllerPublish();
  const cancelMutation = useEventControllerCancel();
  const deleteMutation = useEventControllerDelete();

  const invalidateList = () => {
    queryClient.invalidateQueries({ queryKey: getEventControllerFindAllQueryKey() });
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'publish') {
        await publishMutation.mutateAsync({ id: confirmAction.id });
      } else if (confirmAction.type === 'cancel') {
        await cancelMutation.mutateAsync({ id: confirmAction.id });
      } else if (confirmAction.type === 'delete') {
        await deleteMutation.mutateAsync({ id: confirmAction.id });
      }
      invalidateList();
    } finally {
      setConfirmAction(null);
    }
  };

  const columns = useEventsColumns({
    onPublish: (id) => setConfirmAction({ type: 'publish', id }),
    onCancel: (id) => setConfirmAction({ type: 'cancel', id }),
    onDelete: (id) => setConfirmAction({ type: 'delete', id }),
  });

  // Access nested response: Orval wraps as { data: { data: EventResponseDto[], meta } }
  const events: EventResponseDto[] = (data as any)?.data?.data ?? (data as any)?.data ?? [];

  const filteredEvents =
    statusFilter === 'all'
      ? events
      : events.filter((e) => e.status === statusFilter);

  const stats = {
    total: events.length,
    draft: events.filter((e) => e.status === EventResponseDtoStatus.DRAFT).length,
    published: events.filter((e) => e.status === EventResponseDtoStatus.PUBLISHED).length,
    live: events.filter((e) => e.status === EventResponseDtoStatus.LIVE).length,
    cancelled: events.filter((e) => e.status === EventResponseDtoStatus.CANCELLED).length,
  };

  const isMutating = publishMutation.isPending || cancelMutation.isPending || deleteMutation.isPending;

  const confirmLabels = {
    publish: {
      title: 'Publish Event',
      description: 'Are you sure you want to publish this event? It will become visible to users.',
      action: 'Publish',
    },
    cancel: {
      title: 'Cancel Event',
      description: 'Are you sure you want to cancel this event? This action cannot be undone.',
      action: 'Cancel Event',
    },
    delete: {
      title: 'Delete Event',
      description: 'Are you sure you want to delete this event? This action cannot be undone.',
      action: 'Delete',
    },
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 pt-12 lg:pt-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Events
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your sporting events and competitions.
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => router.push('/admin/events/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="font-heading text-xl sm:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Draft</CardTitle>
            <div className="h-2 w-2 rounded-full bg-secondary" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="font-heading text-xl sm:text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Published</CardTitle>
            <div className="h-2 w-2 rounded-full bg-primary" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="font-heading text-xl sm:text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Live</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="font-heading text-xl sm:text-2xl font-bold">{stats.live}</div>
          </CardContent>
        </Card>
        <Card className="col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Cancelled</CardTitle>
            <div className="h-2 w-2 rounded-full bg-destructive" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="font-heading text-xl sm:text-2xl font-bold">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-heading text-base sm:text-lg font-bold">
                All Events
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View and manage all events in your organization.
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={EventResponseDtoStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={EventResponseDtoStatus.PUBLISHED}>Published</SelectItem>
                <SelectItem value={EventResponseDtoStatus.LIVE}>Live</SelectItem>
                <SelectItem value={EventResponseDtoStatus.CLOSED}>Closed</SelectItem>
                <SelectItem value={EventResponseDtoStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
              <p>Failed to load events.</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : events.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
              <Calendar className="h-12 w-12" />
              <div className="text-center">
                <p className="font-medium text-foreground">No events yet</p>
                <p className="text-sm">Create your first event to get started.</p>
              </div>
              <Button onClick={() => router.push('/admin/events/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredEvents}
              searchKey="name"
              searchPlaceholder="Search events..."
            />
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction && confirmLabels[confirmAction.type].title}
            </DialogTitle>
            <DialogDescription>
              {confirmAction && confirmLabels[confirmAction.type].description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={isMutating}>
              Cancel
            </Button>
            <Button
              variant={confirmAction?.type === 'delete' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={isMutating}
            >
              {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmAction && confirmLabels[confirmAction.type].action}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
