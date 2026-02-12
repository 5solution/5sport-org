'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, Trash2, Pencil, ChevronUp, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  useEventControllerAddDescription,
  useEventControllerDeleteDescription,
  useEventControllerReorderDescriptions,
  getEventControllerFindOneQueryKey,
} from '@/lib/services/events/events';

interface EventDescriptionsTabProps {
  eventId: string;
  descriptions: any[];
}

export function EventDescriptionsTab({ eventId, descriptions }: EventDescriptionsTabProps) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const addMutation = useEventControllerAddDescription();
  const deleteMutation = useEventControllerDeleteDescription();
  const reorderMutation = useEventControllerReorderDescriptions();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getEventControllerFindOneQueryKey(eventId) });
  };

  const handleAdd = async () => {
    if (!content.trim()) return;
    try {
      await addMutation.mutateAsync({
        id: eventId,
        data: { title: title.trim() || undefined, content: content.trim() },
      });
      invalidate();
      setShowAdd(false);
      setTitle('');
      setContent('');
    } catch {}
  };

  const handleDelete = async (descId: string) => {
    try {
      await deleteMutation.mutateAsync({ id: eventId, descId });
      invalidate();
    } catch {}
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newOrder = [...descriptions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newOrder.length) return;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    try {
      await reorderMutation.mutateAsync({
        id: eventId,
        data: { ids: newOrder.map((d: any) => d.id) },
      });
      invalidate();
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Descriptions</h3>
          <p className="text-sm text-muted-foreground">Rich text content blocks for event page</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Description
        </Button>
      </div>

      {descriptions.length === 0 ? (
        <Card>
          <CardContent className="flex h-40 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="font-medium">No descriptions yet</p>
              <p className="text-sm">Add content blocks to describe your event.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {descriptions.map((desc: any, index: number) => (
            <Card key={desc.id}>
              <CardContent className="flex items-start gap-3 py-4">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={index === 0}
                    onClick={() => handleReorder(index, 'up')}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={index === descriptions.length - 1}
                    onClick={() => handleReorder(index, 'down')}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  {desc.title && (
                    <p className="text-sm font-semibold mb-1">{desc.title}</p>
                  )}
                  <div
                    className="text-sm text-muted-foreground line-clamp-3 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: desc.content }}
                  />
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(desc.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Description Block</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input
                placeholder="e.g. About the Tournament"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Content <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Enter description content (HTML supported)..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addMutation.isPending || !content.trim()}>
              {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
