'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  useEventControllerUpdate,
  getEventControllerFindOneQueryKey,
} from '@/lib/services/events/events';
import type { EventResponseDto } from '@/lib/schemas/eventResponseDto';

interface EventSettingsTabProps {
  event: EventResponseDto;
}

export function EventSettingsTab({ event }: EventSettingsTabProps) {
  const queryClient = useQueryClient();
  const updateMutation = useEventControllerUpdate();

  const [bannerEnabled, setBannerEnabled] = useState(event.bannerEnabled);
  const [bannerImageUrl, setBannerImageUrl] = useState(event.bannerImageUrl || '');
  const [bannerCtaUrl, setBannerCtaUrl] = useState(event.bannerCtaUrl || '');
  const [termsFileUrl, setTermsFileUrl] = useState(event.termsFileUrl || '');
  const [conditionsFileUrl, setConditionsFileUrl] = useState(event.conditionsFileUrl || '');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: event.id,
        data: {
          bannerEnabled,
          bannerImageUrl: bannerImageUrl.trim() || undefined,
          bannerCtaUrl: bannerCtaUrl.trim() || undefined,
          termsFileUrl: termsFileUrl.trim() || undefined,
          conditionsFileUrl: conditionsFileUrl.trim() || undefined,
        } as any,
      });
      queryClient.invalidateQueries({ queryKey: getEventControllerFindOneQueryKey(event.id) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Event Settings</h3>
          <p className="text-sm text-muted-foreground">Banner, terms, and conditions</p>
        </div>
        <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>

      {/* Banner Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Banner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Enable Banner</p>
              <p className="text-xs text-muted-foreground">Show a promotional banner on the event page</p>
            </div>
            <Switch checked={bannerEnabled} onCheckedChange={setBannerEnabled} />
          </div>
          {bannerEnabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Banner Image URL</Label>
                <Input
                  placeholder="https://..."
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Banner CTA URL</Label>
                <Input
                  placeholder="https://..."
                  value={bannerCtaUrl}
                  onChange={(e) => setBannerCtaUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Link when users click the banner</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legal Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Legal Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Terms of Service URL</Label>
            <Input
              placeholder="https://..."
              value={termsFileUrl}
              onChange={(e) => setTermsFileUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Conditions URL</Label>
            <Input
              placeholder="https://..."
              value={conditionsFileUrl}
              onChange={(e) => setConditionsFileUrl(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
