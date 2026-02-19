'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, Mail, Phone } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useEventControllerGetBlacklist,
  useEventControllerSetBlacklist,
  getEventControllerGetBlacklistQueryKey,
} from '@/lib/services/events/events';

interface EventBlacklistTabProps {
  eventId: string;
}

export function EventBlacklistTab({ eventId }: EventBlacklistTabProps) {
  const queryClient = useQueryClient();
  const { data: blacklistData } = useEventControllerGetBlacklist(eventId);
  const setBlacklistMutation = useEventControllerSetBlacklist();

  const [raw, setRaw] = useState('');
  const [saved, setSaved] = useState(false);

  const entries: any[] = Array.isArray(blacklistData) ? (blacklistData as any[]) : [];

  useEffect(() => {
    if (entries.length > 0) {
      setRaw(entries.map((e: any) => e.value).join('\n'));
    }
  }, [blacklistData]);

  const handleSave = async () => {
    try {
      await setBlacklistMutation.mutateAsync({
        id: eventId,
        data: { raw },
      });
      queryClient.invalidateQueries({ queryKey: getEventControllerGetBlacklistQueryKey(eventId) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Blacklist</h3>
          <p className="text-sm text-muted-foreground">Block emails or phone numbers from registering</p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={setBlacklistMutation.isPending}>
          {setBlacklistMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saved ? 'Saved!' : 'Save'}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Edit Blacklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Blocked entries</Label>
              <Textarea
                placeholder="Enter emails or phone numbers, separated by spaces or new lines..."
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Separate entries with spaces or new lines. Emails are detected by @ symbol.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Current Entries ({entries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No blocked entries yet.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {entries.map((entry: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    {entry.type === 'EMAIL' ? (
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className="truncate font-mono text-xs">{entry.value}</span>
                    <Badge variant="outline" className="ml-auto text-[10px] shrink-0">
                      {entry.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
