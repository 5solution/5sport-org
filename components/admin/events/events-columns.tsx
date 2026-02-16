'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Eye, Pencil, Trash2, Send, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EventResponseDto } from '@/lib/schemas/eventResponseDto';
import { EventResponseDtoStatus } from '@/lib/schemas/eventResponseDtoStatus';
import { EventStatusBadge } from './event-status-badge';

const sportTypeBadgeVariant: Record<string, 'default' | 'secondary'> = {
  PICKLEBALL: 'default',
  BADMINTON: 'secondary',
};

const sportTypeKeys: Record<string, string> = {
  PICKLEBALL: 'pickleball',
  BADMINTON: 'badminton',
};

export function useEventsColumns({
  onPublish,
  onCancel,
  onDelete,
}: {
  onPublish: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
}): ColumnDef<EventResponseDto>[] {
  const router = useRouter();
  const t = useTranslations('admin.events.columns');
  const tActions = useTranslations('admin.events.actions');
  const tCommon = useTranslations('common');
  const tSports = useTranslations('common.sports');

  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('eventName')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{event.name}</span>
            {event.brand && (
              <span className="text-sm text-muted-foreground">{event.brand}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'sportType',
      header: t('sport'),
      cell: ({ row }) => {
        const sport = row.getValue('sportType') as string;
        const key = sportTypeKeys[sport];
        return (
          <Badge variant={sportTypeBadgeVariant[sport] ?? 'outline'}>
            {key ? tSports(key) : sport}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return <EventStatusBadge status={status} />;
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'eventStartTime',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('startDate')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue('eventStartTime') as string;
        if (!date) return <span className="text-muted-foreground">-</span>;
        return (
          <span className="text-sm">
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {tCommon('columns.created')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string;
        if (!date) return <span className="text-muted-foreground">-</span>;
        return (
          <span className="text-sm">
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const event = row.original;
        const isDraft = event.status === EventResponseDtoStatus.DRAFT;
        const isPublishedOrLive =
          event.status === EventResponseDtoStatus.PUBLISHED ||
          event.status === EventResponseDtoStatus.LIVE;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{tCommon('columns.actions')}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/events/${event.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                {tActions('viewDetails')}
              </DropdownMenuItem>
              {isDraft && (
                <DropdownMenuItem
                  onClick={() => router.push(`/admin/events/${event.id}?edit=true`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {tActions('edit')}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {isDraft && (
                <DropdownMenuItem onClick={() => onPublish(event.id)}>
                  <Send className="mr-2 h-4 w-4" />
                  {tActions('publish')}
                </DropdownMenuItem>
              )}
              {isPublishedOrLive && (
                <DropdownMenuItem onClick={() => onCancel(event.id)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  {tActions('cancelEvent')}
                </DropdownMenuItem>
              )}
              {isDraft && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(event.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {tActions('delete')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
