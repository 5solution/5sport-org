'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, Trash2, Pencil, Ticket, X, Layers, Play, Zap, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { AXIOS_INSTANCE } from '@/lib/api/axiosInstance';
import { Role } from '@/types';

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
import {
  useStageControllerCreate,
  useStageControllerUpdate,
  useStageControllerRemove,
  useStageControllerGenerateMatches,
  useStageControllerFindAllBySession,
  getStageControllerFindAllBySessionQueryKey,
} from '@/lib/services/stages/stages';

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

const defaultStage = {
  name: '',
  stageType: '',
  config: {} as Record<string, any>,
};

const STAGE_TYPE_LABELS: Record<string, string> = {
  ROUND_ROBIN_PLAYOFF: 'Round Robin + Playoff',
  SINGLE_ELIMINATION: 'Single Elimination',
  DOUBLE_ELIMINATION: 'Double Elimination',
  FLEX: 'Flex (Manual)',
};

const STAGE_TYPE_COLORS: Record<string, string> = {
  ROUND_ROBIN_PLAYOFF: 'bg-blue-100 text-blue-700',
  SINGLE_ELIMINATION: 'bg-orange-100 text-orange-700',
  DOUBLE_ELIMINATION: 'bg-purple-100 text-purple-700',
  FLEX: 'bg-gray-100 text-gray-700',
};

const STAGE_STATUS_CONFIG: Record<string, { className: string; label: string }> = {
  DRAFT: { className: 'bg-gray-100 text-gray-600', label: 'Draft' },
  READY: { className: 'border-blue-300 text-blue-600 bg-blue-50', label: 'Ready' },
  IN_PROGRESS: { className: 'bg-primary text-primary-foreground', label: 'In Progress' },
  COMPLETED: { className: 'bg-green-100 text-green-700', label: 'Completed' },
};

function SessionStages({
  eventId,
  sessionId,
  onEditStage,
  onDeleteStage,
  onGenerateMatches,
  isGenerating,
  isDeleting,
}: {
  eventId: string;
  sessionId: string;
  onEditStage: (stage: any) => void;
  onDeleteStage: (stageId: string) => void;
  onGenerateMatches: (stageId: string) => void;
  isGenerating: boolean;
  isDeleting: boolean;
}) {
  const router = useRouter();
  const { data } = useStageControllerFindAllBySession(eventId, sessionId);
  const stages = (data as any) || [];

  if (!stages.length) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        <Layers className="h-3 w-3" />
        Stages
      </p>
      {stages.map((stage: any) => (
        <div
          key={stage.id}
          className="flex items-center justify-between rounded-md border p-2 text-sm"
        >
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STAGE_TYPE_COLORS[stage.stageType] || 'bg-gray-100 text-gray-700'}`}>
              {STAGE_TYPE_LABELS[stage.stageType] || stage.stageType}
            </span>
            <button
              type="button"
              onClick={() => router.push(`/admin/events/${eventId}/stages/${stage.id}`)}
              className="font-medium hover:text-primary hover:underline transition-colors text-left"
            >
              {stage.name}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STAGE_STATUS_CONFIG[stage.status]?.className || ''}`}>
              {STAGE_STATUS_CONFIG[stage.status]?.label || stage.status}
            </span>
            {stage.matches && (
              <Badge variant="outline" className="text-xs">
                {stage.matches.length} matches
              </Badge>
            )}
            {stage.status === 'DRAFT' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onGenerateMatches(stage.id)}
                disabled={isGenerating}
                title="Generate Matches"
              >
                {isGenerating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Zap className="h-3 w-3 text-amber-600" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onEditStage(stage)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={() => onDeleteStage(stage.id)}
              disabled={isDeleting}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EventSessionsTab({ eventId, sessions }: EventSessionsTabProps) {
  const queryClient = useQueryClient();
  // Session state
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

  // Stage state
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [selectedSessionForStage, setSelectedSessionForStage] = useState<string | null>(null);
  const [stageForm, setStageForm] = useState(defaultStage);
  const [stageErrors, setStageErrors] = useState<Record<string, string>>({});
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [showDeleteStage, setShowDeleteStage] = useState(false);
  const [deletingStageId, setDeletingStageId] = useState<string | null>(null);

  const t = useTranslations('admin.events.sessions');
  const tCommon = useTranslations('common');
  const tButtons = useTranslations('common.buttons');
  const { hasRole } = useAuth();
  const isAdmin = hasRole(Role.ADMIN);

  // Seed state
  const [seedingSessionId, setSeedingSessionId] = useState<string | null>(null);
  const [showSeedDialog, setShowSeedDialog] = useState(false);
  const [seedCount, setSeedCount] = useState('8');
  const [isSeedLoading, setIsSeedLoading] = useState(false);

  // Session hooks
  const createSession = useEventControllerCreateSession();
  const updateSession = useEventControllerUpdateSession();
  const deleteSession = useEventControllerDeleteSession();
  const createTicketTier = useEventControllerCreateTicketTier();

  // Stage hooks
  const createStage = useStageControllerCreate();
  const updateStage = useStageControllerUpdate();
  const deleteStage = useStageControllerRemove();
  const generateMatches = useStageControllerGenerateMatches();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getEventControllerFindOneQueryKey(eventId) });
    // Also invalidate all stage queries for this event's sessions
    sessions.forEach((s: any) => {
      queryClient.invalidateQueries({ queryKey: getStageControllerFindAllBySessionQueryKey(eventId, s.id) });
    });
  };

  // ===== Session handlers =====
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

  // ===== Stage handlers =====
  const handleOpenCreateStage = (sessionId: string) => {
    setSelectedSessionForStage(sessionId);
    setStageForm(defaultStage);
    setStageErrors({});
    setEditingStageId(null);
    setShowStageDialog(true);
  };

  const handleEditStage = (stage: any) => {
    setSelectedSessionForStage(stage.sessionId);
    setEditingStageId(stage.id);
    setStageForm({
      name: stage.name,
      stageType: stage.stageType,
      config: stage.config || {},
    });
    setStageErrors({});
    setShowStageDialog(true);
  };

  const handleSaveStage = async () => {
    const newErrors: Record<string, string> = {};
    if (!stageForm.name.trim()) newErrors.name = 'Required';
    if (!stageForm.stageType) newErrors.stageType = 'Required';
    setStageErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const data: any = {
      name: stageForm.name.trim(),
      stageType: stageForm.stageType,
      config: stageForm.config,
    };

    try {
      if (editingStageId) {
        await updateStage.mutateAsync({
          eventId,
          stageId: editingStageId,
          data,
        });
      } else {
        await createStage.mutateAsync({
          eventId,
          sessionId: selectedSessionForStage!,
          data,
        });
      }
      invalidate();
      setShowStageDialog(false);
      setSelectedSessionForStage(null);
      setEditingStageId(null);
      setStageForm(defaultStage);
    } catch {}
  };

  const handleDeleteStageClick = (stageId: string) => {
    setDeletingStageId(stageId);
    setShowDeleteStage(true);
  };

  const handleConfirmDeleteStage = async () => {
    if (!deletingStageId) return;
    try {
      await deleteStage.mutateAsync({ eventId, stageId: deletingStageId });
      invalidate();
      setShowDeleteStage(false);
      setDeletingStageId(null);
    } catch {}
  };

  const handleGenerateMatches = async (stageId: string) => {
    try {
      await generateMatches.mutateAsync({ eventId, stageId });
      invalidate();
    } catch {}
  };

  // ===== Seed handlers (admin only) =====
  const handleOpenSeed = (sessionId: string) => {
    setSeedingSessionId(sessionId);
    setSeedCount('8');
    setShowSeedDialog(true);
  };

  const handleSeedParticipants = async () => {
    if (!seedingSessionId) return;
    const count = parseInt(seedCount) || 8;
    if (count < 1 || count > 64) {
      toast.error('Count must be between 1 and 64');
      return;
    }

    setIsSeedLoading(true);
    try {
      const res = await AXIOS_INSTANCE.post('/seed/register-participants', {
        eventId,
        sessionId: seedingSessionId,
        count,
      });
      const created = Array.isArray(res.data) ? res.data.length : count;
      toast.success(`${created} bot participants registered`);
      invalidate();
      setShowSeedDialog(false);
      setSeedingSessionId(null);
    } catch {
      // Error toast handled by axios interceptor
    } finally {
      setIsSeedLoading(false);
    }
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
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenSeed(session.id)}
                      title="Seed Bot Participants"
                    >
                      <Users className="h-3.5 w-3.5 text-green-600" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenCreateStage(session.id)}
                    title="Add Stage"
                  >
                    <Layers className="h-3.5 w-3.5 text-blue-600" />
                  </Button>
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

                {/* Ticket Tiers */}
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

                {/* Stages - fetched via dedicated API */}
                <SessionStages
                  eventId={eventId}
                  sessionId={session.id}
                  onEditStage={handleEditStage}
                  onDeleteStage={handleDeleteStageClick}
                  onGenerateMatches={handleGenerateMatches}
                  isGenerating={generateMatches.isPending}
                  isDeleting={deleteStage.isPending}
                />
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

      {/* Create/Edit Stage Dialog */}
      <Dialog open={showStageDialog} onOpenChange={setShowStageDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              {editingStageId ? 'Edit Stage' : 'Create Stage'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Stage Name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g., Group Stage, Playoffs, Main Bracket"
                value={stageForm.name}
                onChange={(e) => setStageForm((f) => ({ ...f, name: e.target.value }))}
                maxLength={256}
              />
              {stageErrors.name && <p className="text-sm text-destructive">{stageErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>Stage Type <span className="text-destructive">*</span></Label>
              <Select
                value={stageForm.stageType}
                onValueChange={(v) =>
                  setStageForm((f) => ({
                    ...f,
                    stageType: v,
                    config: v === 'ROUND_ROBIN_PLAYOFF'
                      ? { groupCount: 2, advancePerGroup: 2 }
                      : v === 'SINGLE_ELIMINATION' || v === 'DOUBLE_ELIMINATION'
                      ? { seedingType: 'RANDOM' }
                      : {},
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROUND_ROBIN_PLAYOFF">Round Robin + Playoff</SelectItem>
                  <SelectItem value="SINGLE_ELIMINATION">Single Elimination</SelectItem>
                  <SelectItem value="DOUBLE_ELIMINATION">Double Elimination</SelectItem>
                  <SelectItem value="FLEX">Flex (Manual)</SelectItem>
                </SelectContent>
              </Select>
              {stageErrors.stageType && <p className="text-sm text-destructive">{stageErrors.stageType}</p>}
            </div>

            {/* Stage type description */}
            {stageForm.stageType && (
              <div className="rounded-lg border p-3 bg-muted/50 text-sm text-muted-foreground">
                {stageForm.stageType === 'ROUND_ROBIN_PLAYOFF' && 'Divide into groups for round-robin play; top seeds advance to the finals. Recommended for N > 5.'}
                {stageForm.stageType === 'SINGLE_ELIMINATION' && 'Lose one match and you\'re out. Classic bracket format.'}
                {stageForm.stageType === 'DOUBLE_ELIMINATION' && 'Features both Winners and Losers brackets (second-chance system).'}
                {stageForm.stageType === 'FLEX' && 'Manually arrange and set up the matches yourself.'}
              </div>
            )}

            {/* Conditional config fields */}
            {stageForm.stageType === 'ROUND_ROBIN_PLAYOFF' && (
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-medium text-blue-700">Group Configuration</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-sm">Number of Groups</Label>
                    <Input
                      type="number"
                      min="2"
                      value={stageForm.config.groupCount || 2}
                      onChange={(e) =>
                        setStageForm((f) => ({
                          ...f,
                          config: { ...f.config, groupCount: parseInt(e.target.value) || 2 },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Advance per Group</Label>
                    <Input
                      type="number"
                      min="1"
                      value={stageForm.config.advancePerGroup || 2}
                      onChange={(e) =>
                        setStageForm((f) => ({
                          ...f,
                          config: { ...f.config, advancePerGroup: parseInt(e.target.value) || 2 },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {(stageForm.stageType === 'SINGLE_ELIMINATION' || stageForm.stageType === 'DOUBLE_ELIMINATION') && (
              <div className={`space-y-3 p-4 rounded-lg border ${stageForm.stageType === 'SINGLE_ELIMINATION' ? 'bg-orange-50 border-orange-100' : 'bg-purple-50 border-purple-100'}`}>
                <p className={`text-xs font-medium ${stageForm.stageType === 'SINGLE_ELIMINATION' ? 'text-orange-700' : 'text-purple-700'}`}>Seeding Configuration</p>
                <div className="space-y-1">
                  <Label className="text-sm">Seeding Type</Label>
                  <Select
                    value={stageForm.config.seedingType || 'RANDOM'}
                    onValueChange={(v) =>
                      setStageForm((f) => ({
                        ...f,
                        config: { ...f.config, seedingType: v },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RANDOM">Random</SelectItem>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="RATING">By Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStageDialog(false);
                setEditingStageId(null);
                setStageForm(defaultStage);
              }}
            >
              {tButtons('cancel')}
            </Button>
            <Button
              onClick={handleSaveStage}
              disabled={createStage.isPending || updateStage.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {(createStage.isPending || updateStage.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingStageId ? 'Save Changes' : 'Create Stage'}
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

      {/* Delete Stage Confirmation Dialog */}
      <Dialog open={showDeleteStage} onOpenChange={setShowDeleteStage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Stage</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this stage? All matches within this stage will also be deleted.
            </p>
            <p className="text-sm font-medium">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteStage(false);
                setDeletingStageId(null);
              }}
            >
              {tButtons('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteStage}
              disabled={deleteStage.isPending}
            >
              {deleteStage.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Stage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Seed Bot Participants Dialog (Admin only) */}
      <Dialog open={showSeedDialog} onOpenChange={setShowSeedDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Seed Bot Participants
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Generate bot users and register them as participants in this session. Auto-creates users and athlete profiles if needed.
            </p>
            <div className="space-y-2">
              <Label>Number of Participants <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                min="1"
                max="64"
                value={seedCount}
                onChange={(e) => setSeedCount(e.target.value)}
                placeholder="8"
              />
              <p className="text-xs text-muted-foreground">Min: 1, Max: 64</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSeedDialog(false);
                setSeedingSessionId(null);
              }}
            >
              {tButtons('cancel')}
            </Button>
            <Button
              onClick={handleSeedParticipants}
              disabled={isSeedLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isSeedLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Seed Participants
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
