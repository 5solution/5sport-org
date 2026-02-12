'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, Trash2, Pencil } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useEventControllerCreateSession,
  useEventControllerDeleteSession,
  getEventControllerFindOneQueryKey,
} from '@/lib/services/events/events';

interface EventSessionsTabProps {
  eventId: string;
  sessions: any[];
}

const defaultSession = {
  name: '',
  matchType: '',
  startTime: '',
  endTime: '',
  ticketCode: '',
};

export function EventSessionsTab({ eventId, sessions }: EventSessionsTabProps) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(defaultSession);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createSession = useEventControllerCreateSession();
  const deleteSession = useEventControllerDeleteSession();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getEventControllerFindOneQueryKey(eventId) });
  };

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Required';
    if (!form.matchType) newErrors.matchType = 'Required';
    if (!form.startTime) newErrors.startTime = 'Required';
    if (!form.endTime) newErrors.endTime = 'Required';
    if (!form.ticketCode.trim()) newErrors.ticketCode = 'Required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await createSession.mutateAsync({
        id: eventId,
        data: {
          name: form.name.trim(),
          matchType: form.matchType as any,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
          ticketCode: form.ticketCode.trim(),
        },
      });
      invalidate();
      setShowAdd(false);
      setForm(defaultSession);
    } catch {}
  };

  const handleDelete = async (sessionId: string) => {
    try {
      await deleteSession.mutateAsync({ id: eventId, sessionId });
      invalidate();
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Competition Sessions</h3>
          <p className="text-sm text-muted-foreground">Manage match categories and ticket tiers</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Session
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex h-40 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="font-medium">No sessions yet</p>
              <p className="text-sm">Add your first competition session to get started.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session: any) => (
            <Card key={session.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-sm font-semibold">{session.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{session.matchType}</Badge>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {session.ticketCode}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(session.id)}
                    disabled={deleteSession.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>
                    Start: {new Date(session.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>
                    End: {new Date(session.endTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {session.ticketTiers && session.ticketTiers.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Ticket Tiers</p>
                    {session.ticketTiers.map((tier: any) => (
                      <div
                        key={tier.id}
                        className="flex items-center justify-between rounded-md border p-2 text-sm"
                      >
                        <span>{tier.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">
                            {tier.isFree ? 'Free' : `${tier.price?.toLocaleString()} VND`}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {tier.totalQuantity} tickets
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Session Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Competition Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Men's Singles A"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Match Type <span className="text-destructive">*</span></Label>
                <Select value={form.matchType} onValueChange={(v) => setForm((f) => ({ ...f, matchType: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLES">Singles</SelectItem>
                    <SelectItem value="DOUBLES">Doubles</SelectItem>
                  </SelectContent>
                </Select>
                {errors.matchType && <p className="text-sm text-destructive">{errors.matchType}</p>}
              </div>
              <div className="space-y-2">
                <Label>Ticket Code <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g. MSA"
                  value={form.ticketCode}
                  onChange={(e) => setForm((f) => ({ ...f, ticketCode: e.target.value.toUpperCase() }))}
                  maxLength={3}
                  className="uppercase font-mono"
                />
                {errors.ticketCode && <p className="text-sm text-destructive">{errors.ticketCode}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Time <span className="text-destructive">*</span></Label>
                <Input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                />
                {errors.startTime && <p className="text-sm text-destructive">{errors.startTime}</p>}
              </div>
              <div className="space-y-2">
                <Label>End Time <span className="text-destructive">*</span></Label>
                <Input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                />
                {errors.endTime && <p className="text-sm text-destructive">{errors.endTime}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createSession.isPending}>
              {createSession.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
