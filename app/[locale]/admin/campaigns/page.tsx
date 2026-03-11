'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Megaphone,
  X,
  Ruler,
  Users,
  Phone,
  Link,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useCampaignControllerFindAll,
  useCampaignControllerCreate,
  useCampaignControllerUpdate,
  useCampaignControllerRemove,
  useCampaignControllerUpdateStatus,
  getCampaignControllerFindAllQueryKey,
} from '@/lib/services/campaigns/campaigns';
import {
  useCampaignOrderControllerFindAll,
} from '@/lib/services/campaign-orders/campaign-orders';
import { UpdateCampaignStatusDtoStatus } from '@/lib/schemas/updateCampaignStatusDtoStatus';
import { CampaignOrderControllerFindAllPaymentStatus } from '@/lib/schemas/campaignOrderControllerFindAllPaymentStatus';
import type { CreateCampaignDto } from '@/lib/schemas/createCampaignDto';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  CLOSED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
};

interface DistanceEntry {
  name: string;
  price: string;
}

function parseDistances(distances: any[] = []): DistanceEntry[] {
  return distances.map((d) => {
    if (typeof d === 'object' && d !== null) {
      return { name: String(d.distance ?? d.name ?? ''), price: String(d.price ?? '') };
    }
    return { name: String(d), price: '' };
  });
}

function serializeDistances(entries: DistanceEntry[]): { distance: string; price: number }[] {
  return entries
    .filter((e) => e.name.trim())
    .map((e) => ({ distance: e.name.trim(), price: Number(e.price) || 0 }));
}

const defaultForm: Omit<CreateCampaignDto, 'distances'> = {
  name: '',
  slug: '',
  startTime: '',
  endTime: '',
  description: '',
  bannerUrl: '',
  groupName: '',
  groupLeader: '',
  zaloGroupUrl: '',
  hotline: '',
  regulationsUrl: '',
  fanpageUrl: '',
};

export default function CampaignsPage() {
  const t = useTranslations('admin.campaigns');
  const tButtons = useTranslations('common.buttons');
  const queryClient = useQueryClient();

  const { data: campaignsData, isLoading: campaignsLoading } = useCampaignControllerFindAll();
  const campaigns = Array.isArray(campaignsData) ? campaignsData : [];

  const createCampaign = useCampaignControllerCreate();
  const updateCampaign = useCampaignControllerUpdate();
  const removeCampaign = useCampaignControllerRemove();
  const updateStatus = useCampaignControllerUpdateStatus();

  const [showDialog, setShowDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<CreateCampaignDto, 'distances'>>(defaultForm);
  const [distances, setDistances] = useState<DistanceEntry[]>([]);

  const invalidateCampaigns = () => {
    queryClient.invalidateQueries({ queryKey: getCampaignControllerFindAllQueryKey() });
  };

  const openCreate = () => {
    setEditingCampaign(null);
    setForm(defaultForm);
    setDistances([]);
    setShowDialog(true);
  };

  const openEdit = (campaign: any) => {
    setEditingCampaign(campaign);
    setForm({
      name: campaign.name || '',
      slug: campaign.slug || '',
      startTime: campaign.startTime?.slice(0, 16) || '',
      endTime: campaign.endTime?.slice(0, 16) || '',
      description: campaign.description || '',
      bannerUrl: campaign.bannerUrl || '',
      groupName: campaign.groupName || '',
      groupLeader: campaign.groupLeader || '',
      zaloGroupUrl: campaign.zaloGroupUrl || '',
      hotline: campaign.hotline || '',
      regulationsUrl: campaign.regulationsUrl || '',
      fanpageUrl: campaign.fanpageUrl || '',
    });
    setDistances(parseDistances(campaign.distances || []));
    setShowDialog(true);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      distances: serializeDistances(distances),
    };
    try {
      if (editingCampaign) {
        await updateCampaign.mutateAsync({ id: editingCampaign._id, data: payload as any });
        toast.success(t('messages.updateSuccess'));
      } else {
        await createCampaign.mutateAsync({ data: payload as any });
        toast.success(t('messages.createSuccess'));
      }
      invalidateCampaigns();
      setShowDialog(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('messages.error'));
    }
  };

  const handleUpdateStatus = async (campaignId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id: campaignId, data: { status: status as any } });
      toast.success(t('messages.statusUpdateSuccess'));
      invalidateCampaigns();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('messages.error'));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await removeCampaign.mutateAsync({ id: deleteConfirm });
      toast.success(t('messages.deleteSuccess'));
      invalidateCampaigns();
      if (expandedCampaign === deleteConfirm) setExpandedCampaign(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('messages.error'));
    } finally {
      setDeleteConfirm(null);
    }
  };

  const addDistance = () => setDistances([...distances, { name: '', price: '' }]);
  const removeDistance = (i: number) => setDistances(distances.filter((_, idx) => idx !== i));
  const updateDistance = (i: number, field: 'name' | 'price', value: string) => {
    const next = [...distances];
    if (field === 'price') {
      // Strip non-digits, store as plain number string
      value = value.replace(/[^\d]/g, '');
    }
    next[i] = { ...next[i], [field]: value };
    setDistances(next);
  };

  const formatPriceInput = (raw: string) => {
    const num = raw.replace(/[^\d]/g, '');
    if (!num) return '';
    return Number(num).toLocaleString('vi-VN');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  const formatPrice = (price: string) => {
    const num = Number(price);
    if (!num) return price;
    return num.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 pt-12 lg:pt-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t('description')}
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createCampaign')}
        </Button>
      </div>

      {/* List */}
      {campaignsLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Megaphone className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium text-foreground">{t('noCampaigns')}</p>
            <p className="text-sm">{t('noCampaignsDescription')}</p>
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              {t('createCampaign')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign: any) => (
            <Card key={campaign._id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-sm font-semibold">{campaign.name}</CardTitle>
                      <Badge className={statusColors[campaign.status] || ''} variant="secondary">
                        {t(`statuses.${campaign.status}`)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Slug: {campaign.slug}</span>
                      <span>{t('startTime')}: {formatDate(campaign.startTime)}</span>
                      <span>{t('endTime')}: {formatDate(campaign.endTime)}</span>
                      {campaign.hotline && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />{campaign.hotline}
                        </span>
                      )}
                    </div>
                    {/* Distances preview */}
                    {campaign.distances?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {campaign.distances.map((d: any, i: number) => {
                          const parsed = parseDistances([d])[0];
                          return (
                            <Badge key={i} variant="outline" className="text-xs font-normal">
                              <Ruler className="h-3 w-3 mr-1" />
                              {parsed.name}{parsed.price ? ` — ${formatPrice(parsed.price)}` : ''}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Select
                      value={campaign.status}
                      onValueChange={(val) => handleUpdateStatus(campaign._id, val)}
                    >
                      <SelectTrigger className="h-8 w-[140px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(UpdateCampaignStatusDtoStatus).map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(`statuses.${s}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(campaign)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteConfirm(campaign._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setExpandedCampaign(expandedCampaign === campaign._id ? null : campaign._id)}
                    >
                      {expandedCampaign === campaign._id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedCampaign === campaign._id && (
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('orders.title')}</span>
                  </div>
                  <CampaignOrders campaignId={campaign._id} t={t} />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Campaign Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? t('editCampaign') : t('createCampaign')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('name')} *</Label>
                <Input
                  placeholder={t('namePlaceholder')}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('slug')} *</Label>
                <Input
                  placeholder={t('slugPlaceholder')}
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('campaignDescription')}</Label>
              <Input
                placeholder={t('descriptionPlaceholder')}
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('bannerUrl')}</Label>
              <Input
                placeholder={t('bannerUrlPlaceholder')}
                value={form.bannerUrl || ''}
                onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('startTime')} *</Label>
                <Input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('endTime')} *</Label>
                <Input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>

            <hr className="border-border" />

            {/* Distances */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-primary" />
                  <Label className="text-base font-semibold">{t('distances.title')}</Label>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addDistance}>
                  <Plus className="mr-2 h-3 w-3" />
                  {t('distances.add')}
                </Button>
              </div>

              {distances.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3 rounded-lg border border-dashed">
                  {t('distances.noDistances')}
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs text-muted-foreground px-1">
                    <span>{t('distances.distanceName')}</span>
                    <span>{t('distances.price')}</span>
                    <span className="w-8" />
                  </div>
                  {distances.map((entry, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                      <Input
                        placeholder={t('distances.distancePlaceholder')}
                        value={entry.name}
                        onChange={(e) => updateDistance(i, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="0"
                        value={formatPriceInput(entry.price)}
                        onChange={(e) => updateDistance(i, 'price', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive"
                        onClick={() => removeDistance(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-border" />

            {/* Group info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <Label className="text-base font-semibold">{t('groupInfo')}</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('groupName')}</Label>
                  <Input
                    placeholder={t('groupNamePlaceholder')}
                    value={form.groupName || ''}
                    onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('groupLeader')}</Label>
                  <Input
                    placeholder={t('groupLeaderPlaceholder')}
                    value={form.groupLeader || ''}
                    onChange={(e) => setForm({ ...form, groupLeader: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('hotline')}</Label>
                  <Input
                    placeholder={t('hotlinePlaceholder')}
                    value={form.hotline || ''}
                    onChange={(e) => setForm({ ...form, hotline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('zaloGroupUrl')}</Label>
                  <Input
                    placeholder={t('zaloGroupUrlPlaceholder')}
                    value={form.zaloGroupUrl || ''}
                    onChange={(e) => setForm({ ...form, zaloGroupUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Links */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4 text-primary" />
                <Label className="text-base font-semibold">Links</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('regulationsUrl')}</Label>
                  <Input
                    placeholder={t('regulationsUrlPlaceholder')}
                    value={form.regulationsUrl || ''}
                    onChange={(e) => setForm({ ...form, regulationsUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('fanpageUrl')}</Label>
                  <Input
                    placeholder={t('fanpageUrlPlaceholder')}
                    value={form.fanpageUrl || ''}
                    onChange={(e) => setForm({ ...form, fanpageUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {tButtons('cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                createCampaign.isPending ||
                updateCampaign.isPending ||
                !form.name ||
                !form.slug
              }
            >
              {(createCampaign.isPending || updateCampaign.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {tButtons('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteCampaign')}</DialogTitle>
            <DialogDescription>{t('deleteCampaignConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              {tButtons('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={removeCampaign.isPending}
            >
              {removeCampaign.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tButtons('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CampaignOrders({ campaignId, t }: { campaignId: string; t: any }) {
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: ordersData, isLoading } = useCampaignOrderControllerFindAll(campaignId, {
    paymentStatus: paymentFilter ? (paymentFilter as any) : undefined,
    page,
    limit: 10,
  });

  const orders = Array.isArray(ordersData) ? ordersData : (ordersData as any)?.data ?? [];
  const total = (ordersData as any)?.total ?? orders.length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <Select
          value={paymentFilter}
          onValueChange={(val) => {
            setPaymentFilter(val === 'all' ? '' : val);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue placeholder={t('orders.allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('orders.allStatuses')}</SelectItem>
            {Object.values(CampaignOrderControllerFindAllPaymentStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {t(`orders.paymentStatuses.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">{t('orders.noOrders')}</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('orders.orderId')}</TableHead>
                <TableHead>{t('orders.customerName')}</TableHead>
                <TableHead>{t('orders.phone')}</TableHead>
                <TableHead>{t('orders.email')}</TableHead>
                <TableHead>{t('orders.paymentStatus')}</TableHead>
                <TableHead>{t('orders.createdAt')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id?.slice(0, 8)}...</TableCell>
                  <TableCell>{order.lastName} {order.firstName}</TableCell>
                  <TableCell>{order.phoneNumber}</TableCell>
                  <TableCell>{order.email || '-'}</TableCell>
                  <TableCell>
                    <Badge className={paymentStatusColors[order.paymentStatus] || ''} variant="secondary">
                      {t(`orders.paymentStatuses.${order.paymentStatus}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {total > 10 && (
            <div className="flex justify-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">
                {page} / {Math.ceil(total / 10)}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= Math.ceil(total / 10)}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
