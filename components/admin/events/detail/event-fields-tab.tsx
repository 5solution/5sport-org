'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  useEventControllerGetCustomFields,
  getEventControllerGetCustomFieldsQueryKey,
} from '@/lib/services/events/events';
import { CreateCustomFieldDtoDbMapping } from '@/lib/schemas/createCustomFieldDtoDbMapping';

interface EventFieldsTabProps {
  eventId: string;
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

const dbMappingOptions = Object.values(CreateCustomFieldDtoDbMapping).map((value) => ({
  value,
  label: value,
}));

const defaultForm = {
  label: '',
  fieldName: '',
  description: '',
  fieldType: '',
  options: [] as string[],
  allowedFileTypes: [] as string[],
  defaultValue: '',
  attachmentUrl: '',
  dbMapping: '',
  isRequired: false,
  isVisible: true,
};

export function EventFieldsTab({ eventId }: EventFieldsTabProps) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [optionInput, setOptionInput] = useState('');
  const [fileTypeInput, setFileTypeInput] = useState('');

  const { data: rawFields, isLoading } = useEventControllerGetCustomFields(eventId);
  const fields: any[] = Array.isArray(rawFields) ? rawFields : [];

  const addMutation = useEventControllerAddCustomField();
  const deleteMutation = useEventControllerDeleteCustomField();
  const reorderMutation = useEventControllerReorderCustomFields();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getEventControllerGetCustomFieldsQueryKey(eventId) });
  };

  const handleCloseDialog = () => {
    setShowAdd(false);
    setForm(defaultForm);
    setErrors({});
    setOptionInput('');
    setFileTypeInput('');
  };

  const handleAdd = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.label.trim()) newErrors.label = 'Required';
    if (!form.fieldName.trim()) newErrors.fieldName = 'Required';
    if (!form.fieldType) newErrors.fieldType = 'Required';
    if (isSelectType && form.options.length === 0) newErrors.options = 'At least one option required';
    if (isFileUpload && form.allowedFileTypes.length === 0) newErrors.allowedFileTypes = 'At least one file type required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await addMutation.mutateAsync({
        id: eventId,
        data: {
          label: form.label.trim(),
          fieldName: form.fieldName.trim(),
          description: form.description.trim() || undefined,
          fieldType: form.fieldType as any,
          options: form.options.length > 0 ? (form.options as any) : undefined,
          allowedFileTypes: form.allowedFileTypes.length > 0 ? (form.allowedFileTypes as any) : undefined,
          defaultValue: form.defaultValue.trim() || undefined,
          attachmentUrl: form.attachmentUrl.trim() || undefined,
          dbMapping: (form.dbMapping as any) || undefined,
          isRequired: form.isRequired,
          isVisible: form.isVisible,
        },
      });
      invalidate();
      handleCloseDialog();
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

  const addOption = () => {
    const v = optionInput.trim();
    if (v && !form.options.includes(v)) {
      setForm((f) => ({ ...f, options: [...f.options, v] }));
    }
    setOptionInput('');
  };

  const addFileType = () => {
    const v = fileTypeInput.trim().toLowerCase().replace(/^\./, '');
    if (v && !form.allowedFileTypes.includes(v)) {
      setForm((f) => ({ ...f, allowedFileTypes: [...f.allowedFileTypes, v] }));
    }
    setFileTypeInput('');
  };

  const isSelectType = form.fieldType === 'SINGLE_SELECT' || form.fieldType === 'MULTI_SELECT';
  const isFileUpload = form.fieldType === 'FILE_UPLOAD';

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

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : fields.length === 0 ? (
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
                    disabled={index === fields.length - 1}
                    onClick={() => handleReorder(index, 'down')}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{field.label}</span>
                    <span className="text-xs text-muted-foreground">({field.fieldName})</span>
                    {field.isRequired && (
                      <Badge variant="destructive" className="text-[10px]">Required</Badge>
                    )}
                    {!field.isVisible && (
                      <Badge variant="outline" className="text-[10px]">Hidden</Badge>
                    )}
                  </div>
                  {field.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{field.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">{field.fieldType}</Badge>
                    {field.dbMapping && (
                      <span className="text-[10px] text-muted-foreground">→ {field.dbMapping}</span>
                    )}
                    {field.options && field.options.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">{field.options.length} options</span>
                    )}
                    {field.allowedFileTypes && field.allowedFileTypes.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {field.allowedFileTypes.map((t: string) => `.${t}`).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
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

      <Dialog open={showAdd} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Custom Field</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Label <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Họ và tên"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              />
              {errors.label && <p className="text-xs text-destructive">{errors.label}</p>}
            </div>

            <div className="space-y-2">
              <Label>Field Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. fullName"
                value={form.fieldName}
                onChange={(e) => setForm((f) => ({ ...f, fieldName: e.target.value }))}
              />
              {errors.fieldName && <p className="text-xs text-destructive">{errors.fieldName}</p>}
              <p className="text-xs text-muted-foreground">Used for reporting (camelCase recommended)</p>
            </div>

            <div className="space-y-2">
              <Label>Field Type <span className="text-destructive">*</span></Label>
              <Select
                value={form.fieldType}
                onValueChange={(v) => setForm((f) => ({ ...f, fieldType: v, options: [], allowedFileTypes: [] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fieldType && <p className="text-xs text-destructive">{errors.fieldType}</p>}
            </div>

            {isSelectType && (
              <div className="space-y-2">
                <Label>Options <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add option and press Enter"
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>Add</Button>
                </div>
                {form.options.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {form.options.map((opt) => (
                      <Badge key={opt} variant="secondary" className="gap-1 text-xs">
                        {opt}
                        <button
                          onClick={() => setForm((f) => ({ ...f, options: f.options.filter((o) => o !== opt) }))}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.options && <p className="text-xs text-destructive">{errors.options}</p>}
              </div>
            )}

            {isFileUpload && (
              <div className="space-y-2">
                <Label>Allowed File Types <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. jpg, png, pdf"
                    value={fileTypeInput}
                    onChange={(e) => setFileTypeInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFileType(); } }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addFileType}>Add</Button>
                </div>
                {form.allowedFileTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {form.allowedFileTypes.map((ft) => (
                      <Badge key={ft} variant="secondary" className="gap-1 text-xs">
                        .{ft}
                        <button
                          onClick={() => setForm((f) => ({ ...f, allowedFileTypes: f.allowedFileTypes.filter((t) => t !== ft) }))}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.allowedFileTypes && <p className="text-xs text-destructive">{errors.allowedFileTypes}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Short description shown to registrants..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Default Value</Label>
              <Input
                placeholder="Optional pre-filled value"
                value={form.defaultValue}
                onChange={(e) => setForm((f) => ({ ...f, defaultValue: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Attachment URL</Label>
              <Input
                placeholder="https://... (displayed as hyperlink)"
                value={form.attachmentUrl}
                onChange={(e) => setForm((f) => ({ ...f, attachmentUrl: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>DB Mapping</Label>
              <Select value={form.dbMapping} onValueChange={(v) => setForm((f) => ({ ...f, dbMapping: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Map to participant field (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {dbMappingOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Required</Label>
                  <p className="text-xs text-muted-foreground">Registrant must answer</p>
                </div>
                <Switch
                  checked={form.isRequired}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isRequired: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Visible</Label>
                  <p className="text-xs text-muted-foreground">Show on registration form</p>
                </div>
                <Switch
                  checked={form.isVisible}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isVisible: v }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
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
