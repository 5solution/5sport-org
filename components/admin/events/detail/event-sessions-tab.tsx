'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, Trash2, Pencil, Ticket, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
  useEventControllerUpdateSession,
  useEventControllerDeleteSession,
  useEventControllerCreateTicketTier,
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

const defaultTicketTier = {
  name: '',
  isFree: false,
  price: '',
  totalQuantity: '',
  minPerOrder: '1',
  maxPerOrder: '5',
  isVisible: true,
  saleStartTime: '',
  saleEndTime: '',
};

export function EventSessionsTab({ eventId, sessions }: EventSessionsTabProps) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [showTicketTier, setShowTicketTier] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultSession);
  const [ticketForm, setTicketForm] = useState(defaultTicketTier);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ticketErrors, setTicketErrors] = useState<Record<string, string>>({});

  const t = useTranslations('admin.events.sessions');
  const tCommon = useTranslations('common');
  const tButtons = useTranslations('common.buttons');

  const createSession = useEventControllerCreateSession();
  const updateSession = useEventControllerUpdateSession();
  const deleteSession = useEventControllerDeleteSession();
  const createTicketTier = useEventControllerCreateTicketTier();

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

  const handleEdit = (session: any) => {
    setEditingSessionId(session.id);
    // Convert ISO dates to datetime-local format
    const startDate = new Date(session.startTime);
    const endDate = new Date(session.endTime);
    setForm({
      name: session.name,
      matchType: session.matchType,
      startTime: startDate.toISOString().slice(0, 16),
      endTime: endDate.toISOString().slice(0, 16),
      ticketCode: session.ticketCode,
    });
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Required';
    if (!form.matchType) newErrors.matchType = 'Required';
    if (!form.startTime) newErrors.startTime = 'Required';
    if (!form.endTime) newErrors.endTime = 'Required';
    if (!form.ticketCode.trim()) newErrors.ticketCode = 'Required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await updateSession.mutateAsync({
        id: eventId,
        sessionId: editingSessionId!,
        data: {
          name: form.name.trim(),
          matchType: form.matchType as any,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
          ticketCode: form.ticketCode.trim(),
        },
      });
      invalidate();
      setShowEdit(false);
      setEditingSessionId(null);
      setForm(defaultSession);
    } catch {}
  };

  const handleDelete = (sessionId: string) => {
    setDeletingSessionId(sessionId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSessionId) return;
    try {
      await deleteSession.mutateAsync({ id: eventId, sessionId: deletingSessionId });
      invalidate();
      setShowDeleteConfirm(false);
      setDeletingSessionId(null);
    } catch {}
  };

  const handleCreateTicketTier = async () => {
    const newErrors: Record<string, string> = {};
    if (!ticketForm.name.trim()) newErrors.name = 'Required';
    if (!ticketForm.totalQuantity) newErrors.totalQuantity = 'Required';
    if (!ticketForm.minPerOrder) newErrors.minPerOrder = 'Required';
    if (!ticketForm.maxPerOrder) newErrors.maxPerOrder = 'Required';
    if (!ticketForm.saleStartTime) newErrors.saleStartTime = 'Required';
    if (!ticketForm.saleEndTime) newErrors.saleEndTime = 'Required';
    if (!ticketForm.isFree && !ticketForm.price) newErrors.price = 'Required if not free';

    setTicketErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await createTicketTier.mutateAsync({
        id: eventId,
        sessionId: selectedSessionId!,
        data: {
          name: ticketForm.name.trim(),
          isFree: ticketForm.isFree,
          price: ticketForm.isFree ? 0 : parseInt(ticketForm.price || '0'),
          totalQuantity: parseInt(ticketForm.totalQuantity),
          minPerOrder: parseInt(ticketForm.minPerOrder),
          maxPerOrder: parseInt(ticketForm.maxPerOrder),
          isVisible: ticketForm.isVisible,
          saleStartTime: `${ticketForm.saleStartTime}T00:00:00.000Z`,
          saleEndTime: `${ticketForm.saleEndTime}T23:59:59.999Z`,
        },
      });
      invalidate();
      setShowTicketTier(false);
      setSelectedSessionId(null);
      setTicketForm(defaultTicketTier);
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">{t('title')}</h3>
          <p className="text-sm text-muted-foreground">{t('description')}</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('addSession')}
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex h-40 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="font-medium">{t('noSessionsYet')}</p>
              <p className="text-sm">{t('noSessionsDescription')}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session: any) => (
            <Card key={session.id} className="group hover:shadow-md transition-shadow duration-200">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setSelectedSessionId(session.id);
                      setTicketForm(defaultTicketTier);
                      setShowTicketTier(true);
                    }}
                    title={t('addTicketTier') || 'Add Ticket Tier'}
                  >
                    <Ticket className="h-3.5 w-3.5 text-amber-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(session)}
                  >
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
                    {t('start')} {new Date(session.startTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>
                    {t('end')} {new Date(session.endTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {session.ticketTiers && session.ticketTiers.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">{t('ticketTiers')}</p>
                    {session.ticketTiers.map((tier: any) => (
                      <div
                        key={tier.id}
                        className="flex items-center justify-between rounded-md border p-2 text-sm"
                      >
                        <span>{tier.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">
                            {tier.isFree ? tCommon('free') : `${tier.price?.toLocaleString()} VND`}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {tier.totalQuantity} {t('tickets')}
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
            <DialogTitle>{t('addCompetitionSession')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('name')} <span className="text-destructive">*</span></Label>
              <Input
                placeholder={t('namePlaceholder')}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('matchType')} <span className="text-destructive">*</span></Label>
                <Select value={form.matchType} onValueChange={(v) => setForm((f) => ({ ...f, matchType: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLES">{t('singles')}</SelectItem>
                    <SelectItem value="DOUBLES">{t('doubles')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.matchType && <p className="text-sm text-destructive">{errors.matchType}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t('ticketCode')} <span className="text-destructive">*</span></Label>
                <Input
                  placeholder={t('ticketCodePlaceholder')}
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
                <Label>{t('startTime')} <span className="text-destructive">*</span></Label>
                <Input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                />
                {errors.startTime && <p className="text-sm text-destructive">{errors.startTime}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t('endTime')} <span className="text-destructive">*</span></Label>
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
            <Button variant="outline" onClick={() => setShowAdd(false)}>{tButtons('cancel')}</Button>
            <Button onClick={handleCreate} disabled={createSession.isPending}>
              {createSession.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('createSession')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ticket Tier Creation Dialog */}
      <Dialog open={showTicketTier} onOpenChange={setShowTicketTier}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="relative">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-600" />
              {t('addTicketTier') || 'Create Ticket Tier'}
            </DialogTitle>
            <button
              onClick={() => setShowTicketTier(false)}
              className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-md transition-colors duration-150"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Tier Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('name') || 'Tier Name'} <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g., Early Bird, VIP, Standard"
                value={ticketForm.name}
                onChange={(e) => setTicketForm((f) => ({ ...f, name: e.target.value }))}
                className="border-gray-200"
              />
              {ticketErrors.name && <p className="text-sm text-red-500">{ticketErrors.name}</p>}
            </div>

            {/* Price Section */}
            <div className="space-y-3 p-4 bg-gradient-to-br from-purple-50 to-orange-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={ticketForm.isFree}
                  onChange={(e) => setTicketForm((f) => ({ ...f, isFree: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 cursor-pointer"
                />
                <label htmlFor="isFree" className="text-sm font-medium cursor-pointer">
                  {t('isFree') || 'Free Ticket'}
                </label>
              </div>
              {!ticketForm.isFree && (
                <div className="space-y-2 mt-2">
                  <Label className="text-sm font-medium">{t('price') || 'Price (VND)'} <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    placeholder="500000"
                    value={ticketForm.price}
                    onChange={(e) => setTicketForm((f) => ({ ...f, price: e.target.value }))}
                    min="0"
                    className="border-gray-200"
                  />
                  {ticketErrors.price && <p className="text-sm text-red-500">{ticketErrors.price}</p>}
                </div>
              )}
            </div>

            {/* Quantity Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('totalQuantity') || 'Total Qty'} <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder="100"
                  value={ticketForm.totalQuantity}
                  onChange={(e) => setTicketForm((f) => ({ ...f, totalQuantity: e.target.value }))}
                  min="1"
                  className="border-gray-200"
                />
                {ticketErrors.totalQuantity && <p className="text-xs text-red-500">{ticketErrors.totalQuantity}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('minPerOrder') || 'Min/Order'} <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={ticketForm.minPerOrder}
                  onChange={(e) => setTicketForm((f) => ({ ...f, minPerOrder: e.target.value }))}
                  min="1"
                  className="border-gray-200"
                />
                {ticketErrors.minPerOrder && <p className="text-xs text-red-500">{ticketErrors.minPerOrder}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('maxPerOrder') || 'Max/Order'} <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder="5"
                  value={ticketForm.maxPerOrder}
                  onChange={(e) => setTicketForm((f) => ({ ...f, maxPerOrder: e.target.value }))}
                  min="1"
                  className="border-gray-200"
                />
                {ticketErrors.maxPerOrder && <p className="text-xs text-red-500">{ticketErrors.maxPerOrder}</p>}
              </div>
            </div>

            {/* Sale Time Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('saleStartTime') || 'Sale Start'} <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={ticketForm.saleStartTime}
                  onChange={(e) => setTicketForm((f) => ({ ...f, saleStartTime: e.target.value }))}
                  className="border-gray-200"
                />
                {ticketErrors.saleStartTime && <p className="text-xs text-red-500">{ticketErrors.saleStartTime}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('saleEndTime') || 'Sale End'} <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={ticketForm.saleEndTime}
                  onChange={(e) => setTicketForm((f) => ({ ...f, saleEndTime: e.target.value }))}
                  className="border-gray-200"
                />
                {ticketErrors.saleEndTime && <p className="text-xs text-red-500">{ticketErrors.saleEndTime}</p>}
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="isVisible"
                checked={ticketForm.isVisible}
                onChange={(e) => setTicketForm((f) => ({ ...f, isVisible: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 cursor-pointer"
              />
              <label htmlFor="isVisible" className="text-sm font-medium cursor-pointer flex-1">
                {t('isVisible') || 'Visible to Users'}
              </label>
              <Badge variant={ticketForm.isVisible ? 'default' : 'secondary'}>
                {ticketForm.isVisible ? 'Public' : 'Hidden'}
              </Badge>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowTicketTier(false);
                setSelectedSessionId(null);
                setTicketForm(defaultTicketTier);
              }}
            >
              {tButtons('cancel')}
            </Button>
            <Button
              onClick={handleCreateTicketTier}
              disabled={createTicketTier.isPending}
              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
            >
              {createTicketTier.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('createTicketTier') || 'Create Tier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editSession')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('name')} <span className="text-destructive">*</span></Label>
              <Input
                placeholder={t('namePlaceholder')}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('matchType')} <span className="text-destructive">*</span></Label>
                <Select value={form.matchType} onValueChange={(v) => setForm((f) => ({ ...f, matchType: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLES">{t('singles')}</SelectItem>
                    <SelectItem value="DOUBLES">{t('doubles')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.matchType && <p className="text-sm text-destructive">{errors.matchType}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t('ticketCode')} <span className="text-destructive">*</span></Label>
                <Input
                  placeholder={t('ticketCodePlaceholder')}
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
                <Label>{t('startTime')} <span className="text-destructive">*</span></Label>
                <Input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                />
                {errors.startTime && <p className="text-sm text-destructive">{errors.startTime}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t('endTime')} <span className="text-destructive">*</span></Label>
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
            <Button
              variant="outline"
              onClick={() => {
                setShowEdit(false);
                setEditingSessionId(null);
                setForm(defaultSession);
              }}
            >
              {tButtons('cancel')}
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateSession.isPending}>
              {updateSession.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('saveSession')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Session Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">{t('deleteSessionTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('deleteSessionMessage')}
            </p>
            <p className="text-sm font-medium">
              {t('deleteSessionWarning')}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeletingSessionId(null);
              }}
            >
              {tButtons('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteSession.isPending}
            >
              {deleteSession.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('deleteSession')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
