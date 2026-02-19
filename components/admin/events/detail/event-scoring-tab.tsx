'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useEventControllerGetScoringConfig,
  useEventControllerSaveScoringConfig,
  getEventControllerFindOneQueryKey,
  getEventControllerGetScoringConfigQueryKey,
} from '@/lib/services/events/events';

interface EventScoringTabProps {
  eventId: string;
  sportType: string;
}

const defaultConfig = {
  sportType: '',
  scoringMode: '',
  matchFormat: '',
  pointsToWin: 11,
  winByTwo: true,
  pointCap: '',
  switchEndsAt: '',
};

export function EventScoringTab({ eventId, sportType }: EventScoringTabProps) {
  const queryClient = useQueryClient();
  const { data: scoringData } = useEventControllerGetScoringConfig(eventId);
  const saveMutation = useEventControllerSaveScoringConfig();

  const [form, setForm] = useState(defaultConfig);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const config = scoringData as any;
    if (config) {
      setForm({
        sportType: config.sportType || sportType,
        scoringMode: config.scoringMode || '',
        matchFormat: config.matchFormat || '',
        pointsToWin: config.pointsToWin || 11,
        winByTwo: config.winByTwo ?? true,
        pointCap: config.pointCap?.toString() || '',
        switchEndsAt: config.switchEndsAt?.toString() || '',
      });
    } else {
      setForm((f) => ({ ...f, sportType }));
    }
  }, [scoringData, sportType]);

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({
        id: eventId,
        data: {
          sportType: form.sportType as any,
          scoringMode: form.scoringMode as any,
          matchFormat: form.matchFormat as any,
          pointsToWin: Number(form.pointsToWin),
          winByTwo: form.winByTwo,
          pointCap: form.pointCap ? Number(form.pointCap) : undefined,
          switchEndsAt: form.switchEndsAt ? Number(form.switchEndsAt) : undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getEventControllerGetScoringConfigQueryKey(eventId) });
      queryClient.invalidateQueries({ queryKey: getEventControllerFindOneQueryKey(eventId) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Scoring Configuration</h3>
          <p className="text-sm text-muted-foreground">Set up match rules for {sportType === 'PICKLEBALL' ? 'Pickleball' : 'Badminton'}</p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saved ? 'Saved!' : 'Save Config'}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Scoring Mode</Label>
              <Select value={form.scoringMode} onValueChange={(v) => setForm((f) => ({ ...f, scoringMode: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RALLY_POINT">Rally Point</SelectItem>
                  <SelectItem value="SIDE_OUT">Side Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Match Format</Label>
              <Select value={form.matchFormat} onValueChange={(v) => setForm((f) => ({ ...f, matchFormat: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_SET">1 Set</SelectItem>
                  <SelectItem value="BEST_OF_3">Best of 3</SelectItem>
                  <SelectItem value="BEST_OF_5">Best of 5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Points to Win</Label>
              <Input
                type="number"
                min={11}
                value={form.pointsToWin}
                onChange={(e) => setForm((f) => ({ ...f, pointsToWin: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Point Cap</Label>
              <Input
                type="number"
                placeholder="Optional"
                value={form.pointCap}
                onChange={(e) => setForm((f) => ({ ...f, pointCap: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Max score to end a set</p>
            </div>
            {sportType === 'PICKLEBALL' && (
              <div className="space-y-2">
                <Label>Switch Ends At</Label>
                <Input
                  type="number"
                  placeholder="0 = disabled"
                  value={form.switchEndsAt}
                  onChange={(e) => setForm((f) => ({ ...f, switchEndsAt: e.target.value }))}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Win by Two</p>
              <p className="text-xs text-muted-foreground">Require 2-point lead to win a set</p>
            </div>
            <Switch
              checked={form.winByTwo}
              onCheckedChange={(v) => setForm((f) => ({ ...f, winByTwo: v }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
