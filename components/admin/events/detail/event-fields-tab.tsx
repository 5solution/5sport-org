'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  useEventControllerAddCustomField,
  useEventControllerDeleteCustomField,
  useEventControllerReorderCustomFields,
  getEventControllerFindOneQueryKey,
} from '@/lib/services/events/events';

interface EventFieldsTabProps {
  eventId: string;
  fields: any[];
}

const fieldTypes = [
  { value: 'TEXT', label: 'Text' },
  { value: 'PROVINCE', label: 'Province' },
  { value: 'COUNTRY', label: 'Country' },
  { value: 'SINGLE_SELECT', label: 'Single Select' },
  { value: 'MULTI_SELECT', label: 'Multi Select' },
  { value: 'DATE', label: 'Date' },
  { value: 'FILE_UPLOAD', label: 'File Upload' },
];

const defaultField = {
  label: '',
  fieldType: '',
  required: false,
  placeholder: '',
};

export function EventFieldsTab({ eventId, fields }: EventFieldsTabProps) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(defaultField);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addMutation = useEventControllerAddCustomField();
  const deleteMutation = useEventControllerDeleteCustomField();
  const reorderMutation = useEventControllerReorderCustomFields();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getEventControllerFindOneQueryKey(eventId) });
  };

  const handleAdd = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.label.trim()) newErrors.label = 'Required';
    if (!form.fieldType) newErrors.fieldType = 'Required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await addMutation.mutateAsync({
        id: eventId,
        data: {
          label: form.label.trim(),
          fieldType: form.fieldType as any,
          required: form.required,
          placeholder: form.placeholder.trim() || undefined,
        } as any,
      });
      invalidate();
      setShowAdd(false);
      setForm(defaultField);
    } catch {}
  };

  const handleDelete = async (fieldId: string) => {
    try {
      await deleteMutation.mutateAsync({ id: eventId, fieldId });
      invalidate();
    } catch {}
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newOrder = [...fields];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newOrder.length) return;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    try {
      await reorderMutation.mutateAsync({
        id: eventId,
        data: { ids: newOrder.map((f: any) => f.id) },
      });
      invalidate();
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Custom Fields</h3>
          <p className="text-sm text-muted-foreground">Registration form builder</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Field
        </Button>
      </div>

      {fields.length === 0 ? (
        <Card>
          <CardContent className="flex h-40 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="font-medium">No custom fields yet</p>
              <p className="text-sm">Add questions for the registration form.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {fields.map((field: any, index: number) => (
            <Card key={field.id}>
              <CardContent className="flex items-center gap-3 py-3">
                <div className="flex flex-col gap-0.5">
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0} onClick={() => handleReorder(index, 'up')}>
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === fields.length - 1} onClick={() => handleReorder(index, 'down')}>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{field.label}</span>
                    {field.required && <Badge variant="destructive" className="text-[10px]">Required</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{field.fieldType}</span>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{field.fieldType}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive shrink-0"
                  onClick={() => handleDelete(field.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Field</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Label <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Phone Number"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              />
              {errors.label && <p className="text-sm text-destructive">{errors.label}</p>}
            </div>
            <div className="space-y-2">
              <Label>Field Type <span className="text-destructive">*</span></Label>
              <Select value={form.fieldType} onValueChange={(v) => setForm((f) => ({ ...f, fieldType: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fieldType && <p className="text-sm text-destructive">{errors.fieldType}</p>}
            </div>
            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input
                placeholder="e.g. Enter your phone number"
                value={form.placeholder}
                onChange={(e) => setForm((f) => ({ ...f, placeholder: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Required</Label>
              <Switch checked={form.required} onCheckedChange={(v) => setForm((f) => ({ ...f, required: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addMutation.isPending}>
              {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
